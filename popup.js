$( document ).ready(function() {

    // alert("welcome");
    $("body").append('Test');
    $("#status").text("hello world");


    // var url = window.location.href;
    $.ajax({
      url: window.location.href,
      cache: false,
      success: function(html){
        $("#status").append("---" + html + "___");
      }
    });
});

$("#status").text("outside func")
