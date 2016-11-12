$( document ).ready(function() {

    // alert("welcome");
    $("body").append('Test');
    $("#status").text("hello world");


    // var url = window.location.href;
    $.ajax({
      url: "https://gateway-a.watsonplatform.net/calls/url/URLGetAuthors?apikey=aee14f13b4f1254971213bab9b2c86b41e9c5fad",
      data:{
        url: window.location.href
      },
      cache: false,
      success: function(data){
        $("#status").append("---" + data + "___");
      }
    });
});

$("#status").text("outside func")
