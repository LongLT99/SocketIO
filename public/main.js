var socket = io();
$("#send_button").click(function() {
  $("form").submit();
});
$("form").submit(function(e) {
  if ($("#inboxuser option:selected").text() == "chat room") {
    e.preventDefault(); // prevents page reloading
    socket.emit("send_chat_mess_to_sever", $("#m").val());
  } else {
    e.preventDefault(); // prevents page reloading
    socket.emit( "private message", $("#inboxuser option:selected").text(), $("#m").val() ); // private mess
  }
  if ($("#inputuse").val() == "") {
    alert("Please enter your name");
  }
  socket.emit("disconnect", $("#inputuse").val());
  $("#m").val("");
  return false;
});

$("#buton").click(function() {//create user
  // user name
  if ($("#inputuse").val() == "") {
    alert("Please enter your name");
  } else {
    socket.emit("setSocketId", { name: $("#inputuse").val(), userId: socket.id }); //send username +id ->setSocketId
    socket.emit("changeuser", { username: $("#inputuse").val() }); // send username -> changeuser
  }
});

socket.on('room_alert',function(room){
  alert("already had room name : "+ room.room_name);
});


$("#roomb").click(function() {//create room
  if ($("#in_room").val() == "") {
    alert("please enter room's name");
  } else {
    var pass = prompt("enter your room password");
    if(pass!=null){
      socket.emit("setRoom", { roomName: $("#in_room").val(), username: $("#inputuse").val(), pass_room : pass });
    }else{
      alert("create room fail");
    }
  }
});
socket.on('name_alert',function(name){
  alert( name.taken_name + " is taken. Try another");
});

$("#roomj").click(function() {
  if($("#room_name").val()!="all"){
    var passr = prompt("enter room's password please ");
    if(passr!=null){
      socket.emit("joinRoom", { roomName: $("#room_name").val(), username: $("#inputuse").val(), room_pass : passr });
    }else{
      alert("join room fail");
    }
  }else{
    alert("all is not a room");
  }
});

socket.on('join_alert',function(data){
  alert("wrong password of room : "+data.room_name );
})

socket.on("list_room", function(room) {
  $("#room_name").empty();
  $("#room_name").append("<option>" + "all" + "</option>");
  $.each(room, function(username) {
    $("#room_name").append("<option>" + username + "</option>");
  });
});

socket.on("changeuser", function(data) {
  $("#messages").append("<li>" + data.user + " is connect"); // connected user notication
  socket.on("update", function(list) {// update online user
    $("#online_user").empty();
    $.each(list, function(username) {
      $("#online_user").append("<li>" + username);
    });
    //update list user to select user
    $("#inboxuser").empty();
    $("#inboxuser").append("<option>chat room</option>");
    $.each(list, function(username) {
      if(username!=$("#inputuse").val()){
        $("#inboxuser").append("<option>" + username + "</option>");
      }
    });
  });
});

socket.on("leave", function(user, room) {
  $("#messages").append("<li>" + user + " is disconnect"); // disconnected user notication
  $("#room_name").empty();
  $("#room_name").append("<option>" + "all" + "</option>");
  $.each(room, function(username) {
    $("#room_name").append("<option>" + username + "</option>");
  });
});

socket.on("send_chat_mess_to_clien", function(data) {
  $("#messages").append("<li>" + data.username + ": " + data.msg); // send message
  $("#cbox").scrollTop($("#messages").height());
});

socket.on("chat private", function(data, to) {// inbox private
  $("#privates").append("<li> from " + data.username + " to " + to.touser + ": " + data.msg); // send private message
  $("#ibox").scrollTop($("#ibox").height());
  $("#refresh").click(function() {// refresh button
    $("#privates").empty();
  });
});