$(document).ready(function(){

   var stories = $("div[role='article'][aria-label='Story']");
   console.log(stories)
   var links = [];

   for(var i = 0; i < stories.length; i++){
        var story_links = $(stories[i]).find("a")
        for(var j = 0; j < story_links.length; j++){
            var link_str = $(story_links[j]).attr("href")
            if(is_outside_URL(link_str)){
                links.push(link_str)
            }
        }
   }

   /*stories.each(function() {
        var story_links = $(this).find("a")
        story_links.each(function() {
            links.push($(this).attr("href"));
        });
   });*/

   console.log(links)
   /*
   for(var i = links.length -1; i >= 0 ; i--){
        if(!(is_outside_URL(links[i]))){
            console.log("removed " + links[i])
            links.splice(i, 1);
        }
    }
   console.log(links)*/
});

function is_outside_URL(url){
    var facebook_patt = /facebook.com/;
    var https_patt = /https?:/;
    return url.search(https_patt) > -1 && url.search(facebook_patt) == -1;
}

