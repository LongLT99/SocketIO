var check_t;
$("#m").focus(function(){
    if($('#chat-type').val() == "chat room" && $("#m").val()!=""){
      check_t=1;
      socket.emit('typing',$('#inname').text(),check_t);
    }else{
      check_t=0;
      socket.emit('typing',$('#inname').text(),check_t);
    }
});

$("#m").focusout(function(){
    const check_f=0;
    socket.emit('typing',$('#inputuse').val(),check_f);
});

socket.on('is_typing', function(name){
    $("#typing").empty();
    $("#typing").append(name + " is typing ...");
});
socket.on("is_not_typing",function(name){
  $("#typing").empty();
});