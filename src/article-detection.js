var DIFFBOT_TOKEN = "70ff6ee7380c5db201485b5f6da1f6b2"
var client;
var isArticle = false;

function detectArticle(url, callback){
  $.get("https://api.diffbot.com/v3/analyze", {
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
      $("body").append("<div id='article-detect-modal' style='position:fixed;z-index:1000;right:2em;bottom:2em;width:12em;height:3.6em;background-color:rgb(200,232,197);border:1px solid rgb(68, 157, 68);opacity:0;-webkit-transition:opacity 1.5s;box-shadow: 0px 3px 5px rgba(0,0,0,0.3);border-radius:5px;padding:0.5em'><p style='font-family:\"Open Sans\";color:rgb(34,100,34);text-align:center;line-height:1.2em;'>Ethos Extension<br />can analyze this article</p></div>");
      $("#article-detect-modal").css("opacity", 0.75);
      setTimeout(function(){
        $("#article-detect-modal").fadeOut(1000);
      }, 7500);
    }else{
      isArticle = false;
    }
  });
});
