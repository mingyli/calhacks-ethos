$( document ).ready(function() {

    // alert("welcome");
    $("body").append('Test');
    $("#status").text("hello world");

    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        console.log(tabs[0].url);
        make_request(tabs[0].url);
    });

    // var url = window.location.href;
    function make_request(tab_url){
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetAuthors?apikey=aee14f13b4f1254971213bab9b2c86b41e9c5fad",
            type: "POST",
            data:{
                // apikey: "aee14f13b4f1254971213bab9b2c86b41e9c5fad",
                outputMode: "json",
                url: tab_url,

            },
            cache: false,
            success: function(data){
                console.log(data)
                var authors = data.authors.names

                // $("#status").append("---" + authors + "___");
            }
        });
    }
});
