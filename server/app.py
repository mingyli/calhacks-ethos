import os
import json
from flask import Flask
from Author import Author
from watson_developer_cloud import AlchemyDataNewsV1

app = Flask(__name__)
API_KEY = os.environ['IBM_WATSON_API_KEY']

@app.route("/author/<author>/taxonomy/<taxonomy>")
def main(author, taxonomy):
    return json.dumps(rate(author, taxonomy))

alchemy_data_news = AlchemyDataNewsV1(api_key=API_KEY)

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
    results = alchemy_data_news.get_news_documents(
            start=start_range,
            end="now",
            max_results=1,
            query_fields={
                'enriched.url.author': author.name
                }, 
            return_fields=['enriched.url.taxonomy', 'enriched.url.text', 'enriched.url.url'])
    update_personality_of(author, results)
    update_personality_of(author, results)
    update_taxonomy_of(author, results)
    return get_author(author)

def update_objectivity_of(author, data):
    pass

def update_personality_of(author, data):
    pass

def update_taxonomy_of(author, data):
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
