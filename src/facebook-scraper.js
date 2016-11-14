$(document).ready(function(){
  if(window.location.hostname != "www.facebook.com") return;
  init();
});

var lowest = 0;
var IBM_WATSON_API_KEY = "4eb7a087879404f17ee265805231d3bc7116ca56"
var ratings = 0;
var urlRatingMap = {}

function init(){
  scanStories();
  setInterval(scanStories, 2000);
  $(window).scroll(function(){
    var current = $(document).scrollTop();
    if(current - lowest > 250){
      lowest = current;
      scanStories();
    }
  });
}

function isOutsideURL(url){
    var facebook_patt = /facebook.com/;
    var https_patt = /https?:/;
    return url.search(https_patt) > -1 && url.search(facebook_patt) == -1;
}

function addRating(stories, links){
    for(var i = 0; i < stories.length; i++){
        if($(stories[i]).find('.article-rating').length > 0) continue;
        var ratingBar = "<div id = 'rating-bar-" + ratings + "' class = 'article-rating' style='width:100%;height:2em;box-shadow: 0px 2px 5px rgba(0,0,0,0.5);font-size:1.2em;z-index:1000;text-align:center;position:relative;padding:0.5em;color:white;box-sizing:border-box;opacity:0.9;'><span style='color:black'>Analyzing article...</span></div>";

        $(stories[i]).children().first().after(ratingBar);
        urlRatingMap[links[i]] = ratings;
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetTextSentiment?apikey=" + IBM_WATSON_API_KEY,
            type: "POST",
            data:{
                outputMode: "json",
                url: links[i],
            },
            async: true,
            success: function(data){
              var ratingBarId = "#rating-bar-" + urlRatingMap[data.url];
              var currentStyle = $(ratingBarId).attr('style');
              if(data.status == "OK"){
                var articleObj = Math.max(100 - (Math.abs(parseFloat(data.docSentiment.score)) * 200.0), 0);
                articleObj = articleObj.toFixed(2);
                var color = '#5cb85c';
                if(articleObj < 70) color = '#f0ad4e';
                if(articleObj < 30) color = '#c9302c';
                $(ratingBarId).text("Objectivity - " + articleObj);
                $(ratingBarId).attr('style', currentStyle + 'background-color:' + color + ';');
              }else{
                $(ratingBarId).text("Could not analyze article");
                $(ratingBarId).attr('style', currentStyle + 'color:black;');
              }
            }
        });
        ratings++;
    }
}

var scanLock = false;

function scanStories(){
   if(scanLock) return;
   scanLock = true;
   var stories = $("div[role='article'][aria-label='Story']");
   var links = [];
   var article_stories = [];
   for(var i = 0; i < stories.length; i++){
     if(($(stories[i]).find("div[role='article'][aria-label='Story']")).length > 0) continue;
        var story_links = $(stories[i]).find("a");
        for(var j = 0; j < story_links.length; j++){
            var link_str = $(story_links[j]).attr("href");
            if(isOutsideURL(link_str)){
                article_stories.push(stories[i]);
                links.push(link_str);
                break;
            }
        }
   }
   addRating(article_stories, links)
   scanLock = false;
}
