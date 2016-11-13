$( document ).ready(function() {
    var apikey;
    var author = undefined;
    var taxonomy = undefined;
    $.getJSON('credentials.json', function(data) {
        apikey = data.apikey;
        console.log(apikey);
    });
    
    $(".btn").click(function(){
        console.log("click");
        $(".btn-holder").remove();
        $("#feedback-text").text("Thank you for your feedback.")
    });

    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        console.log(tabs[0].url);
        $('[data-toggle="tooltip"]').tooltip();
        make_author_request(tabs[0].url);
    });

    function make_author_request(tab_url){
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetAuthors?apikey=" + apikey,
            type: "POST",
            data:{
                outputMode: "json",
                url: tab_url,
            },
            cache: false,
            success: function(data){
                console.log(data)
                author = data.authors.names[0];
                
                if (author == undefined) {
                    console.log("No author");
                    $("#header-text").text("No author found");
                    $("#article-hover").remove();
                    $("table").remove();
                    $("#author").remove();
                    
                    return;
                }
               
                console.log("It kept going");
                $("#author").text(author + "'s profile:");
                make_sentiment_request(tab_url);
                make_taxonomy_request(tab_url);
                make_profile_request();
            }
        });
        // $.getJSON("testjsons/author.json", function(json) {
        //     console.log(json);
        //     var author = json.authors.names[0];
        //     $("#author").text(author + "'s profile:");
        // });
    };

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
                console.log(data);
                var article_obj = 100 - (Math.abs(parseFloat(data.docSentiment.score)) * 200.0);
                article_obj = article_obj.toFixed(2);

                var str_value = generate_bar(article_obj, "#article-bar");
                $("#article-hover").attr('title', str_value).tooltip('fixTitle');
            }
        });
        // $.getJSON("testjsons/sentiment.json", function(json) {
        //     console.log(json);
        //     var article_obj = 100 - (Math.abs(parseFloat(json.docSentiment.score)) * 200.0);
        //     article_obj = article_obj.toFixed(2);
        //
        //     var str_value = generate_bar(article_obj, "#article-bar");
        //     //$("#article-bar").text(str_value);
        //     $("#article-hover").attr('title', str_value).tooltip('fixTitle');
        //
        // });
    };

    function make_taxonomy_request(tab_url){
        $.ajax({
            url: "https://gateway-a.watsonplatform.net/calls/url/URLGetRankedTaxonomy?apikey=" + apikey,
            type: "POST",
            data:{
                outputMode: "json",
                url: tab_url,

            },
            cache: false,
            success: function(data){
                console.log(data)
                taxonomy = data.taxonomy[0].label.split("/")[1];
                make_profile_request();
            }
        });
        // $.getJSON("testjsons/author.json", function(json) {
        //     console.log(json);
        //     var author = json.authors.names[0];
        //     $("#author").text(author + "'s profile:");
        // });
    };

    function make_profile_request() {
        // TODO get ajax from matthew server
        if (author == undefined || taxonomy == undefined) {
            return;
        }

        $.ajax({
            url: "https://calhacks16.herokuapp.com/author/" + escape(author) + "/taxonomy/" + escape(taxonomy),
            type: "GET",
            cache: false,
            success: function(data){
                console.log(data);
                data = JSON.parse(data);
                
                if (data.status != "OK") {
                    display_error_message("could not retrieve other articles by this author");
                    return;
                }
                
                var author_obj = 100 - (Math.abs(parseFloat(data.bias)) * 200.0);
                console.log(data.bias);
                author_obj = author_obj.toFixed(2);

                var str_value = generate_bar(author_obj, "#author-obj-bar");
                // $("#author-bias-bar").text("Bias: " + str_value);
                $("#obj-hover").attr('title', str_value).tooltip('fixTitle');

                var author_openness = Math.abs(parseFloat(data.openness)) * 200.0;
                author_openness = author_openness.toFixed(2);

                var str_value2 = generate_bar(author_openness, "#author-open-bar");
                $("#openness-hover").attr('title', str_value2).tooltip('fixTitle');

                var taxonomies = data.taxonomies;

                var array = [];
                for(a in taxonomies){
                    console.log(a)
                    array.push([a,taxonomies[a]])
                }
                array.sort(function(a,b){return b[1] - a[1]});
                console.log(array);

                var num_taxonomies = Object.keys(taxonomies).length;
                var total_articles = 0;
                var lengths = [];
                var strs = [];

                for (i=0; i<3; i++) {
                    lengths[i] = 0;
                    strs[i] = "";
                }

                for (i=0; i< Math.min(3, num_taxonomies); i++) {
                    total_articles += array[i][1];
                }

                for (i=0; i< Math.min(3, num_taxonomies); i++) {
                    lengths[i] = array[i][1]/total_articles * 100;
                    if (array[i][1] === 1) {
                        strs[i] = " article";
                    }
                    else {
                        strs[i] = " articles";
                    }
                }

                $("#topic1-bar").css("width",String(lengths[0])+"%");
                $("#topic2-bar").css("width",String(lengths[1])+"%");
                $("#topic3-bar").css("width",String(lengths[2])+"%");
                
                $("#stacked-bar").tooltip("disable");
                $("#topic1-bar").attr('title', String(array[0][1]) + " " + array[0][0] + strs[0]).tooltip('fixTitle');
                if (num_taxonomies > 1) {
                    $("#topic2-bar").attr('title', String(array[1][1]) + " " + array[1][0] + strs[1]).tooltip('fixTitle');
                }
                if (num_taxonomies > 2) {
                    $("#topic3-bar").attr('title', String(array[2][1]) + " " + array[2][0] + strs[2]).tooltip('fixTitle');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                display_error_message("could not retrieve other articles by this author");
            }

        });

        author = undefined;
        taxonomy = undefined;

        // $.getJSON("testjsons/profile.json", function(json) {
        //     console.log(json);
        //     var author_obj = 100 - (Math.abs(parseFloat(json.bias)) * 200.0);
        //     author_obj = author_obj.toFixed(2);
        //
        //     var str_value = generate_bar(author_obj, "#author-obj-bar");
        //     // $("#author-bias-bar").text("Bias: " + str_value);
        //     $("#obj-hover").attr('title', str_value).tooltip('fixTitle');
        //
        //     var author_openness = Math.abs(parseFloat(json.openness)) * 200.0;
        //     author_openness = author_openness.toFixed(2);
        //
        //     var str_value2 = generate_bar(author_openness, "#author-open-bar");
        //     $("#openness-hover").attr('title', str_value2).tooltip('fixTitle');
        //
        //     var taxonomies = json.taxonomies;
        //     var num_taxonomies = Object.keys(taxonomies).length;
        //
        //     var array = [];
        //     for(a in taxonomies){
        //         array.push([a,taxonomies[a]])
        //     }
        //     array.sort(function(a,b){return b[1] - a[1]});
        //     console.log(array);
        //
        //     var total_articles = array[0][1] + array[1][1] + array[2][1];
        //     var lengths = [];
        //     var strs = [];
        //
        //     for (i=0; i<3; i++) {
        //         lengths[i] = array[i][1]/total_articles * 100;
        //         if (array[i][1] === 1) {
        //             strs[i] = " article";
        //         }
        //         else {
        //             strs[i] = " articles";
        //         }
        //     }
        //
        //     $("#topic1-bar").css("width",String(lengths[0])+"%");
        //     $("#topic2-bar").css("width",String(lengths[1])+"%");
        //     $("#topic3-bar").css("width",String(lengths[2])+"%");
        //     $("#topic1-bar").attr('title', String(array[0][1]) + " " + array[0][0] + strs[0]).tooltip('fixTitle');
        //     $("#topic2-bar").attr('title', String(array[1][1]) + " " + array[1][0] + strs[1]).tooltip('fixTitle');
        //     $("#topic3-bar").attr('title', String(array[2][1]) + " " + array[2][0] + strs[2]).tooltip('fixTitle');
        // });

    };


    // takes a percentage value and the id of the html element and updates
    // the appearance of the bar
    function generate_bar(value, id) {
        if (value < 0) {
            value = 0;
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
    
    function display_error_message(error_str) {
        $("#obj-hover").attr('title', error_str).tooltip('fixTitle');
        $("#openness-hover").attr('title', error_str).tooltip('fixTitle');
        $("#stacked-bar").attr('title', error_str).tooltip('fixTitle');
    }
});
