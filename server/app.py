import os
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from watson_developer_cloud import AlchemyDataNewsV1
from watson_developer_cloud import AlchemyLanguageV1
from watson_developer_cloud import PersonalityInsightsV3
from watson_developer_cloud import WatsonException

PORT = os.environ['PORT'] if ('PORT' in os.environ) else 5000
API_KEY = os.environ['IBM_WATSON_API_KEY']
API_USERNAME = os.environ['IBM_SERVICE_USERNAME']
API_PASSWORD = os.environ['IBM_SERVICE_PASSWORD']
DEVELOPMENT = (os.environ['FLASK_ENVIRONMENT'] == 'development')
DATABASE_URL = os.environ['DATABASE_URL']
NEWS_DATE_RANGE = os.environ['NEWS_DATE_RANGE'] if ('NEWS_DATE_RANGE' in os.environ) else 'now-10d' 
NEWS_MAX_RESULTS = os.environ['NEWS_MAX_RESULTS'] if ('NEWS_MAX_RESULTS' in os.environ) else 10

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
db = SQLAlchemy(app)
CORS(app)

from Author import Author
@app.route("/author/<author_name>/taxonomy/<taxonomy>")
def api(author_name, taxonomy):
    return json.dumps(rate(author_name, taxonomy))

alchemy_language = AlchemyLanguageV1(api_key=API_KEY)
alchemy_data_news = AlchemyDataNewsV1(api_key=API_KEY)
personality_insights = PersonalityInsightsV3(
                        version = '2016-10-20',
                        username = API_USERNAME,
                        password = API_PASSWORD)
@app.route("/author/list")
def list_authors():
    cache = CachedAuthor.query.all()
    cache = [{'name': author.name, 'objectivity': author.objectivity} for author in cache]
    ret = {"status": "OK",
            "result": cache }
    return json.dumps(ret)

sample_author = Author("John Doe")

def rate(author_name, taxonomy):
    author = get_author_by_name(author_name)
    if author.no_data: return {"status" : "No data"}

    if taxonomy in author.taxonomies:
        author.taxonomies[taxonomy] += 1
    else:
        author.taxonomies[taxonomy] = 1

    familiarity = author.taxonomies[taxonomy] / sum(author.taxonomies.values())
    author.familiarity = familiarity
    result = {
            "status": "OK",
            "name": author.name,
            "bias": author.objectivity,
            "familiarity": author.familiarity,
            "openness": author.openness,
            "taxonomies": author.taxonomies
            }
    return result

def update_author(author):
    print(author.name, "to be updated,")
    start_range = 'now-5d' if DEVELOPMENT else NEWS_DATE_RANGE
    try:
        articles = alchemy_data_news.get_news_documents(
                start=start_range,
                end="now",
                max_results= (3 if DEVELOPMENT else NEWS_MAX_RESULTS),
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
        author.no_data = True
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
    print(author.name, "updated.")
    return author

def update_objectivity_of(author, data):
    average_sentiment = 0
    counted = 0
    for sentiment in data: 
        try:
            average_sentiment += abs(float(sentiment['docSentiment']['score']))
            counted += 1
        except KeyError:
            continue
    average_sentiment /= counted
    author.objectivity = average_sentiment
    log(average_sentiment)
    return average_sentiment

def update_personality_of(author, data):
    full_text = ""
    for text in data: full_text += text['text'] + " "
    try:
        personality = personality_insights.profile(full_text.encode('utf-8'))
    except WatsonException as e:
        print(e)
    author.personality = personality
    
    if 'values' in author.personality:
        for trait in author.personality['values']:
            if trait['trait_id'] != "value_openness_to_change": continue
            author.openness = trait['percentile']
            break

    log(personality)
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
    log(taxonomies)
    return taxonomies

def get_author_by_name(name):
    cache = CachedAuthor.query.filter_by(name=name).first()
    if not cache:
        author = Author(name)
        update_author(author)
        cached_author = CachedAuthor.fromAuthor(author)
        db.session.add(cached_author)
        db.session.commit()
    else:
        author = Author.fromCache(cache)
        if not author.objectivity: update_author(author)
    return author
    
def build_sample_author():
    global sample_author
    sample_name = "Michael D. Shear"
    sample_author = Author(sample_name)
    sample_author.build_sample_data()
    return sample_author

## DB Classes

class CachedAuthor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    objectivity = db.Column(db.Float)
    openness = db.Column(db.Float)
    personality = db.Column(db.Text)
    taxonomies = db.Column(db.Text)
    
    def __init__(self, name, objectivity=None, openness=None, personality = (), taxonomies = ()):
        self.name = name
        self.objectivity = objectivity
        self.openness = openness
        self.personality = json.dumps(personality)
        self.taxonomies = json.dumps(taxonomies)
    
    def __repr__(self):
        return "<CachedAuthor {}\n objectivity:{}\npersonality:{}\n,openness:{}\ntaxonomies:{}>".format(self.name, self.objectivity, self.personality, self.openness, self.taxonomies)

    @classmethod
    def fromAuthor(cls, author):
        return cls( author.name, \
                    author.objectivity, \
                    author.openness, \
                    author.personality, \
                    author.taxonomies \
                    )

## Utils
def log(obj):
    if not DEVELOPMENT: return
    print(obj)

## Flask Main

if __name__ == "__main__":
    build_sample_author()
    db.create_all()
    app.run(host='0.0.0.0', port=PORT)
