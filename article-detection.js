var DIFFBOT_TOKEN = "70ff6ee7380c5db201485b5f6da1f6b2"
var client = new Diffbot(DIFFBOT_TOKEN);
function isArticle(url, callback){
  client.analyze.get(
    {url:url}, 
    function onSuccess(response){
      callback((response["type"] == "article"));
    }, 
    function onError(response){
      console.log(response.error);
    }
  );
}
