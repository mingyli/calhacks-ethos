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
        make_profile_request();
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
        $.getJSON("testjsons/author.json", function(json) {
            console.log(json);
            var author = json.authors.names[0];
            $("#author").append(author);
        });
    };

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
        $.getJSON("testjsons/sentiment.json", function(json) {
            console.log(json);
            var article_bias = Math.abs(parseFloat(json.docSentiment.score)) * 200.0;
            article_bias = article_bias.toFixed(2);

            var str_value = change_bar_color(article_bias, "#article-bar");
            $("#article-bar").text(str_value);

        });
    };

    function make_profile_request() {
        // TODO get ajax from matthew server
        $.getJSON("testjsons/profile.json", function(json) {
            console.log(json);
            var author_bias = Math.abs(parseFloat(json.bias)) * 200.0;
            author_bias = author_bias.toFixed(2);

            var str_value = change_bar_color(author_bias, "#author-bias-bar");
            $("#author-bias-bar").text("Bias: " + str_value);


            var author_openness = Math.abs(parseFloat(json.openness)) * 200.0;
            author_openness = author_openness.toFixed(2);

            var str_value = change_bar_color(author_openness, "#author-open-bar");
            $("#author-open-bar").text("Openness: " + str_value);
        });

    };


    // takes a percentage value and the id of the html element and updates
    // the appearance of the bar
    function change_bar_color(value, id) {
        if (value > 100) {
            value = 100;
        }
        if (value > 70) {
            $(id).addClass("progress-bar-danger");
        }
        else if (value > 30) {
            $(id).addClass("progress-bar-warning");
        }
        else {
            $(id).addClass("progress-bar-success");
        }
        var str = String(value);
        $(id).css("width",str+"%");
        return str
    };
});
