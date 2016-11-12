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
    return results 

if __name__ == "__main__":
    app.run()
