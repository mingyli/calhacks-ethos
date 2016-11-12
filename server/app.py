import os
import json
from flask import Flask
from Author import Author
from watson_developer_cloud import AlchemyDataNewsV1

app = Flask(__name__)
API_KEY = os.environ['IBM_WATSON_API_KEY']
API_USERNAME = os.environ['IBM_SERVICE_USERNAME']
API_PASSWORD = os.environ['IBM_SERVICE_PASSWORD']

@app.route("/author/<author>/taxonomy/<taxonomy>")
def main(author, taxonomy):
    return json.dumps(rate(author, taxonomy))

alchemy_language = AlchemyLanguageV1(api_key=API_KEY)
alchemy_data_news = AlchemyDataNewsV1(api_key=API_KEY)
personality_insights = PersonalityInsightsV3(
                        version = '2016-10-20',
                        username = API_USERNAME,
                        password = API_PASSWORD)

def rate(author, taxonomy):
    update_author(author)
    author = get_author(author)
    if taxonomy in author.taxonomies:
        familiarity = author.taxonomies[taxonomy] / sum(author.taxonomies.values())
    else:
        familiarity = 0
    result = {
            "name": author.name,
            "familiarity": familiarity,
            "personality": author.personality
            }
    return result

def update_author(author):
    start_range = 'now-10d'
    articles = alchemy_data_news.get_news_documents(
            start=start_range,
            end="now",
            max_results=1,
            query_fields={
                'enriched.url.author': author.name
                }, 
            return_fields=['enriched.url.taxonomy', 'enriched.url.text', 'enriched.url.url'])
    emotion_data = []
    text_data = []
    combined_operations = ['doc-emotion', 'doc-sentiment']
    for article in articles['result']['docs']:
        article_url =  article['source']['enriched']['url']['url']
        emotion = alchemy_language.combined(url = article_url, extract = combined_operations)
        text = alchemy_language.text(url = article_url)
        emotion_data.append(emotion)
        text_data.append(text)

    update_objectivity_of(author, emotion_data)
    update_personality_of(author, text_data)
    update_taxonomy_of(author, articles)

    return get_author(author)

def update_objectivity_of(author, data):
    pass

def update_personality_of(author, data):
    full_text = ""
    for text in data: full_text += text['text'] + " "
    personality = personality_insights.profile(full_text.encode('utf-8')) 
    author.personality = personality
    return personality

def update_taxonomy_of(author, articles):
    pass

sample_author = Author("John Doe", {}, {})

def get_author(author):
    return sample_author

def build_sample_author():
    sample_name = "Michael D. Shear"
    sample_author = Author(sample_name)
    update_author_objectivity(sample_author)
    update_author_taxonomy(sample_author)
    update_author_personality(sample_author)
    return sample_author

if __name__ == "__main__":
    app.run()
