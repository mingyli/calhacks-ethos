import os
import json
from flask import Flask
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
    update_author_personality(author)
    update_author_taxonomy(author)
    return get_author(author)

def update_author_personality(author):
    pass

def update_author_taxonomy(author):
    pass

sample_author = Author("John Doe", {}, {})

def get_author(author):
    return sample_author

class Author:
    def __init__(self, name, personality, taxonomies):
        self.name = name
        self.personality = personality
        self.taxonomies = taxonomies

if __name__ == "__main__":
    app.run()
