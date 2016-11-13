var DIFFBOT_TOKEN = "70ff6ee7380c5db201485b5f6da1f6b2"
var client;
var isArticle = false;

function detectArticle(url, callback){
  $.get("http://api.diffbot.com/v3/analyze", {
    token:"70ff6ee7380c5db201485b5f6da1f6b2",
    url:url
  },
    function success(data){
      var article = (data["type"] == "article");
      callback(article);
    }
  );
}

$(document).ready(function(){
  detectArticle(window.location.href, function(article){
    if(article){
      isArticle = true;
      console.log("article!");
    }else{
      isArticle = false;
      console.log("not article!");
    }
  });
});
