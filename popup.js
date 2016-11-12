$( document ).ready(function() {
    var apikey;
    $.getJSON('credentials.json', function(data) {
        apikey = data.apikey;
        console.log(apikey);
    });


    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        console.log(tabs[0].url);
        make_author_request(tabs[0].url);
        make_sentiment_request(tabs[0].url);
    });

    function make_author_request(tab_url){
        // $.ajax({
        //     url: "https://gateway-a.watsonplatform.net/calls/url/URLGetAuthors?apikey=" + apikey,
        //     type: "POST",
        //     data:{
        //         outputMode: "json",
        //         url: tab_url,
        //
        //     },
        //     cache: false,
        //     success: function(data){
        //         console.log(data)
        //         var author = data.authors.names[0]
        //         $("#author").append(author);
        //     }
        // });
        $.getJSON("author.json", function(json) {
            console.log(json);
            var author = json.authors.names[0];
            $("#author").append(author);
        });
    }

    function make_sentiment_request(tab_url){
        // $.ajax({
        //     url: "https://gateway-a.watsonplatform.net/calls/url/URLGetTextSentiment?apikey=" + apikey,
        //     type: "POST",
        //     data:{
        //         outputMode: "json",
        //         url: tab_url,
        //     },
        //     cache: false,
        //     success: function(data){
        //         console.log(data)
        //         var sentiment = Math.abs(parseFloat(data.docSentiment.score)) * 20.0;
        //         sentiment = sentiment.toFixed(2);
        //         $("#sentiment").append(String(sentiment))
        //     }
        // });
        $.getJSON("sentiment.json", function(json) {
            console.log(json);
            var sentiment = Math.abs(parseFloat(json.docSentiment.score)) * 20.0;
            sentiment = sentiment.toFixed(2);
            
            if (sentiment > 10) {
                sentiment = 10
            }
            if (sentiment > 7) {
                $("#article-bar").addClass("progress-bar-danger");
            }
            else if (sentiment > 3) {
                $("#article-bar").addClass("progress-bar-warning");
            }
            else {
                $("#article-bar").addClass("progress-bar-success");
            }
            
            var sentiment_str = String(sentiment*10);
            
            $( "#article-bar" ).css("width",sentiment_str+"%");
            $( "#article-bar" ).text(sentiment_str);
        });
    }
});
