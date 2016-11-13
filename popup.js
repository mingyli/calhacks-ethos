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
        $('[data-toggle="tooltip"]').tooltip();
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
            $("#author").text(author + "'s profile:");
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
            var article_obj = 100 - (Math.abs(parseFloat(json.docSentiment.score)) * 200.0);
            article_obj = article_obj.toFixed(2);

            var str_value = change_bar_color(article_obj, "#article-bar");
            //$("#article-bar").text(str_value);
            $("#article-hover").attr('title', str_value).tooltip('fixTitle');

        });
    };

    function make_profile_request() {
        // TODO get ajax from matthew server
        $.getJSON("testjsons/profile.json", function(json) {
            console.log(json);
            var author_obj = 100 - (Math.abs(parseFloat(json.bias)) * 200.0);
            author_obj = author_obj.toFixed(2);

            var str_value = change_bar_color(author_obj, "#author-obj-bar");
            // $("#author-bias-bar").text("Bias: " + str_value);
            $("#obj-hover").attr('title', str_value).tooltip('fixTitle');

            var author_openness = Math.abs(parseFloat(json.openness)) * 200.0;
            author_openness = author_openness.toFixed(2);

            var str_value2 = change_bar_color(author_openness, "#author-open-bar");
            $("#openness-hover").attr('title', str_value2).tooltip('fixTitle');
            
            var taxonomies = json.taxonomies;
            var num_taxonomies = Object.keys(taxonomies).length;
            
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {
                var list = [['Topic', 'Number of Articles']]
                for (i=0; i<num_taxonomies; i++) {
                    var temp = [Object.keys(taxonomies)[i], taxonomies[Object.keys(taxonomies)[i]]];
                    list.push(temp);
                }
                

                var data = google.visualization.arrayToDataTable(list);

                var options = {
                title: 'My Daily Activities'
                };

                var chart = new google.visualization.PieChart(document.getElementById('piechart'));

                chart.draw(data, options);
            }
        });

    };


    // takes a percentage value and the id of the html element and updates
    // the appearance of the bar
    function change_bar_color(value, id) {
        if (value > 100) {
            value = 100;
        }
        if (value > 70) {
            $(id).addClass("progress-bar-success");
        }
        else if (value > 30) {
            $(id).addClass("progress-bar-warning");
        }
        else {
            $(id).addClass("progress-bar-danger");
        }
        var str = String(value);
        $(id).css("width",str+"%");
        return str
    };
});
