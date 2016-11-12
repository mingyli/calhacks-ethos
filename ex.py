API_KEY = 'aee14f13b4f1254971213bab9b2c86b41e9c5fad'

import json
from watson_developer_cloud import AlchemyLanguageV1

alchemy_language = AlchemyLanguageV1(api_key=API_KEY)


print(json.dumps(
  alchemy_language.sentiment(
    url='http://www.huffingtonpost.com/2010/06/22/iphone-4-review-the-worst_n_620714.html'),
  indent=2))


print(json.dumps(
  alchemy_language.targeted_sentiment(
    url='http://www.zacks.com/stock/news/207968/stock-market-news-for-february-19-2016',
    targets=['NASDAQ', 'Dow']),
  indent=2))
