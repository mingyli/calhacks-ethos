$(document).ready(function(){

   var stories = $("div[role='article'][aria-label='Story']");
   console.log(stories)
   var links = [];

   //links.push($(stories[2]).find("a").attr("href"))
   stories.each(function() {
        var story_links = $(this).find("a")
        story_links.each(function() {
            links.push($(this).attr("href"));
        });
   });

   console.log(links)
   for(var i = links.length -1; i >= 0 ; i--){
        if(!(is_outside_URL(links[i]))){
            console.log("removed " + links[i])
            links.splice(i, 1);
        }
    }
   console.log(links)
});

function is_outside_URL(url){
    var facebook_patt = /facebook.com/;
    var https_patt = /https?:/;
    return url.search(https_patt) > -1 && url.search(facebook_patt) == -1
}
