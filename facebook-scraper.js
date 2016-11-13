$(document).ready(function(){

   var stories = $("div[role='article'][aria-label='Story']");
   console.log(stories);
   var links = [];
   var article_stories = [];

   for(var i = 0; i < stories.length; i++){
        var story_links = $(stories[i]).find("a");
        for(var j = 0; j < story_links.length; j++){
            var link_str = $(story_links[j]).attr("href");
            if(is_outside_URL(link_str)){
                article_stories.push(stories[i]);
                links.push(link_str);
                break;
            }
        }
   }
   console.log(article_stories)
   console.log(links);
   add_rating(article_stories)
});

function is_outside_URL(url){
    var facebook_patt = /facebook.com/;
    var https_patt = /https?:/;
    return url.search(https_patt) > -1 && url.search(facebook_patt) == -1;
}

function add_rating(stories){
    for(var i = 0; i < stories.length; i++){
        var rect = "<div style='width:500px;height:100px;border:1px solid #000;''>This is a rectangle!</div>"
        $(stories[i]).children().first().after(rect)
    }
}
