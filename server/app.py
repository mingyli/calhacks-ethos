import os
import json
from flask import Flask
from Author import Author
from watson_developer_cloud import AlchemyDataNewsV1
from watson_developer_cloud import AlchemyLanguageV1
from watson_developer_cloud import PersonalityInsightsV3
from watson_developer_cloud import WatsonException

app = Flask(__name__)
API_KEY = os.environ['IBM_WATSON_API_KEY']
API_USERNAME = os.environ['IBM_SERVICE_USERNAME']
API_PASSWORD = os.environ['IBM_SERVICE_PASSWORD']
DEVELOPMENT = (os.environ['ENVIRONMENT'] == 'development')

@app.route("/author/<author>/taxonomy/<taxonomy>")
def main(author, taxonomy):
    return json.dumps(rate(author, taxonomy))

alchemy_language = AlchemyLanguageV1(api_key=API_KEY)
alchemy_data_news = AlchemyDataNewsV1(api_key=API_KEY)
personality_insights = PersonalityInsightsV3(
                        version = '2016-10-20',
                        username = API_USERNAME,
                        password = API_PASSWORD)

sample_author = Author("John Doe")

def rate(author, taxonomy):
    if DEVELOPMENT:
        author = sample_author
        print(author)
    else:
        update_author(author)

    if taxonomy in author.taxonomies:
        familiarity = author.taxonomies[taxonomy] / sum(author.taxonomies.values())
    else:
        familiarity = 0

    for trait in author.personality['values']:
        if trait['trait_id'] != "value_openness_to_change": continue
        author.openness = trait['percentile']
        break

    author.familiarity = familiarity
    result = {
            "name": author.name,
            "objectivity": author.objectivity,
            "familiarity": author.familiarity,
            "openness": author.openness,
            "taxonomies": author.taxonomies
            }
    return result

def update_author(author):
    start_range = 'now-7d'
    try:
        articles = alchemy_data_news.get_news_documents(
                start=start_range,
                end="now",
                max_results=1,
                query_fields={
                    'enriched.url.author': author.name
                    }, 
                return_fields=['enriched.url.taxonomy', 'enriched.url.url'])
        emotion_data = []
        text_data = []
        combined_operations = ['doc-emotion', 'doc-sentiment']
        articles = articles['result']['docs']
    except KeyError:
        print(articles['status'])
        return
    for article in articles:
        article_url =  article['source']['enriched']['url']['url']
        print(article_url)
        try:
            emotion = alchemy_language.combined(url = article_url, extract = combined_operations)
            text = alchemy_language.text(url = article_url)
            emotion_data.append(emotion)
        except WatsonException as e:
            print(e)
        text_data.append(text)

    update_objectivity_of(author, emotion_data)
    update_personality_of(author, text_data)
    update_taxonomy_of(author, articles)
    return author

def update_objectivity_of(author, data):
    average_sentiment = 0
    for sentiment in data: average_sentiment += abs(float(sentiment['docSentiment']['score']))
    average_sentiment /= len(data)
    objectivity = average_sentiment * 20
    author.objectivity = objectivity
    print(objectivity)
    return objectivity

def update_personality_of(author, data):
    full_text = ""
    for text in data: full_text += text['text'] + " "
    personality = personality_insights.profile(full_text.encode('utf-8')) 
    author.personality = personality
    print(personality)
    return personality

def update_taxonomy_of(author, articles):
    taxonomies = {}
    for article in articles:
        article_taxonomies = article['source']['enriched']['url']['taxonomy']
        for taxonomy in article_taxonomies:
            if float(taxonomy['score']) < 0.5: continue
            label = taxonomy['label'].split('/')[1]
            if label in taxonomies:
                taxonomies[label] += 1
            else:
                taxonomies[label] = 1
    author.taxonomies = taxonomies
    print(taxonomies)
    return taxonomies

def get_author(author):
    return sample_author

def build_sample_author():
    global sample_author
    sample_name = "Michael D. Shear"
    sample_author = Author(sample_name)
    sample_author.build_sample_data()
    #update_author(sample_author)
    return sample_author

if __name__ == "__main__":
    build_sample_author()
    app.run()
