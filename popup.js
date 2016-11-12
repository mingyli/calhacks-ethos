$( document ).ready(function() {
    var apikey;
    $.getJSON('credentials.json', function(data) {
        apikey = data.apikey;
        console.log(apikey);
    });
    // alert("welcome");
    // $("#status").text("hello world");

    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        console.log(tabs[0].url);
        make_author_request(tabs[0].url);
        make_sentiment_request(tabs[0].url);
    });

    // var url = window.location.href;
    function make_author_request(tab_url){
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetAuthors?apikey=" + apikey,
            type: "POST",
            data:{
                // apikey: "aee14f13b4f1254971213bab9b2c86b41e9c5fad",
                outputMode: "json",
                url: tab_url,

            },
            cache: false,
            success: function(data){
                console.log(data)
                var author = data.authors.names[0]
                $("#author").append(author);
            }
        });
    }

    function make_sentiment_request(tab_url){
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetTextSentiment?apikey=" + apikey,
            type: "POST",
            data:{
                outputMode: "json",
                url: tab_url,
            },
            cache: false,
            success: function(data){
                console.log(data)
                // var sentiment = Math.round(Math.abs(parseFloat(data.docSentiment.score)) * 10) / 10.0;
                var sentiment = Math.abs(parseFloat(data.docSentiment.score)) * 20.0;
                sentiment = sentiment.toFixed(2);
                $("#sentiment").append(String(sentiment))
            }
        });
    }

});
