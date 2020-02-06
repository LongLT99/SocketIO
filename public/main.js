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
    socket.emit(
      "private message",
      $("#inboxuser option:selected").text(),
      $("#m").val()
    ); // private mess
  }
  if ($("#inputuse").val() == "") {
    alert("Please enter your name");
  }
  socket.emit("disconnect", $("#inputuse").val());
  $("#m").val("");
  return false;
});

$("#buton").click(function() {
  // user name
  if ($("#inputuse").val() == "") {
    alert("Please enter your name");
  } else {
    socket.emit("setSocketId", {
      name: $("#inputuse").val(),
      userId: socket.id
    }); //truyen username +id ->setSocketId
    socket.emit("changeuser", { username: $("#inputuse").val() }); // truyen user name -> changeuser
    $("#online_user").append(
      '<li class="list-group-item">' + $("#inputuse").val()
    ); //append list user
  }
});
$("#roomb").click(function() {
  if ($("#in_room").val() == "") {
    alert("please enter room's name");
  } else {
    alert("Wellcome to room");
    socket.emit("setRoom", {
      roomName: $("#in_room").val(),
      username: $("#inputuse").val()
    });
  }
  $("#in_room").val("");
});

$("#refresh").click(function() {
  $("#ibox").empty(); // reset in box
});
socket.on("changeuser", function(data) {
  // connect user
  $("#messages").append("<li>" + data.user + " is connect"); // connected user notication
  socket.on("update", function(list) {
    // update online user
    $("#online_user").empty();
    $.each(list, function(username) {
      $("#online_user").append("<li>" + username);
    });
  });
});
socket.on("changeuser", function(list) {
  socket.on("update", function(list) {
    //update list user to select user
    $("#inboxuser").empty();
    $("#inboxuser").append("<option>" + "chat room" + "</option>");
    $("#room_name").append("<option>" + "all" + "</option>");
    $.each(list, function(username) {
      $("#inboxuser").append("<option>" + username + "</option>");
    });
  });
});
socket.on("leave", function(list) {
  $("#messages").append("<li>" + list.user + " is disconnect"); // disconnected user notication
});
socket.on("send_chat_mess_to_clien", function(data) {
  $("#messages").append("<li>" + data.username + ": " + data.msg); // send message
  $("#cbox").scrollTop($("#cbox").height());
});
socket.on("chat private", function(data, to) {
  // private mess
  $("#privates").append(
    "<li> from " + data.username + " to " + to.touser + ": " + data.msg
  ); // send message
  $("#ibox").scrollTop($("#ibox").height());
});
function openStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}