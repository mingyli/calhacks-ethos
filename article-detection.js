var DIFFBOT_TOKEN = "70ff6ee7380c5db201485b5f6da1f6b2"
var client;

function isArticle(url, callback){
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
  isArticle(window.location.href, function(article){
    if(article){
      console.log("article!");
    }else{
      console.log("not article!");
    }
  });
});
