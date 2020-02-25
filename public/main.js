var socket = io();

$("#send_button").click(function() {
  $("form").submit();
});

$("form").submit(function(e) {
  if ($("#m").val() != "") {
    // not empty mess
    if ($("#chat-type option:selected").text() == "chat room") {
      if ($("#room_name option:selected").text() != "" && $("#rname").html() != "" ) {
        e.preventDefault(); // prevents page reloading
        socket.emit("send_to_room", $("#m").val());
      } else {
        $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("you need in a room to chat room !!!");
      }
    } else if ($("#chat-type option:selected").text() == "chat all") {
      e.preventDefault();
      socket.emit("send_to_all", $("#m").val());
    } else {
      if ($("#inboxuser option:selected").text() != "Choose friends ...") {
        e.preventDefault();
        socket.emit(
          "private message",
          $("#inboxuser option:selected").text(),
          $("#m").val()
        ); // private mess
      } else {
        $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("you need choose a friend to chat private !!!");
      }
    }
  }
  socket.emit("disconnect", $("#inputuse").val());
  $("#m").val("");
  return false;
});

$("#buton").click(function() {
  //create user
  // user name
  if ($("#inputuse").val() == "") {
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("Please enter your name !!!");
  } else {
    socket.emit("setSocketId", {name: $("#inputuse").val(), userId: socket.id }); //send username +id ->setSocketId
    socket.emit("changeuser", { username: $("#inputuse").val() }); // send username -> changeuser
  }
  $("#inputuse").val("");
});

socket.on("change_user", function(data) {
  $("#buton").val("change name")
  $("#messages").append("<li>" + data.user + " is connect"); // connected user notication
  socket.on("update", function(list) {
    // update online user
    $("#online_user").empty();
    $.each(list, function(username) {
      $("#online_user").append("<li>" + username);
    });
    //update list user to select user
    $("#inboxuser").focus(function() {
      $("#inboxuser").empty();
      $("#inboxuser").append("<option>Choose friends ...</option>");
      $.each(list, function(username) {
        if (username.localeCompare($("#inname").text().trim()) != 0) {
          $("#inboxuser").append("<option>" + username + "</option>");
        }
      });
    });
    //update user for chat call
    $("#add_g").empty();
    $("#add_g").append("<option> Choose friend to call</option>");
    for (x in list) {
      if (x.localeCompare($("#inname").text().trim()) != 0) {
        $("#add_g").append("<option>" + x + "</option>");
      }
    }
  });
});

socket.on("name_alert", function(name) {
  $("#noname").modal();
  $("#alert_no").empty();
  $("#alert_no").append(name.taken_name + " is taken. Try another");
});

socket.on("get_info", function(data) {
  // show info user to menu bar
  $("#info").show();
  $("#inname").remove();
  $("#info").append('<span id ="inname"> ' + data.user + "</span>");
});

socket.on("leave", function(user, room) {
  $("#messages").append("<li>" + user + " is disconnect"); // disconnected user notication
  $("#room_name").empty();
  $.each(room, function(username) {
    $("#room_name").append("<option>" + username + "</option>");
  });
});

//Chat
socket.on("send_to_clien", function(data) {
  // chat room
  $("#messages").append("<li>" + data.username + ": " + data.msg); // send message
  $("#cbox").scrollTop($("#messages").height());
});

socket.on("chat_all", function(data) {
  // chat all
  $("#messages").append("<li>" + data.username + " to all : " + data.msg);
  $("#cbox").scrollTop($("#messages").height());
});

socket.on("chat private", function(data, to) {
  // caht private
  $("#privates").append(
    "<li> from " + data.username + " to " + to.touser + ": " + data.msg
  ); // send private message
  $("#ibox").scrollTop($("#ibox").height());
  $("#refresh").click(function() {
    // refresh button
    $("#privates").empty();
  });
});

// chat emoji
var iconid = 128512;
$("#icon_button").click(function() {
  while (iconid < 128592) {
    $("#emoji").append('<button type="button" id="icon_' +
      iconid +'" class="btn btn-light" style="width:20%; font-size:x-large" onclick="pick_emoji(icon_' +
      iconid +')">&#'+ iconid +";</button>");
    iconid += 1;
  }
});

function pick_emoji(emoji) {
  $("#m").val($("#m").val() + $(emoji).html()).focus();
}

//typing
var check_t;
$("#m").focus(function() {
  if ($("#chat-type").val() == "chat room" && $("#m").val() != "") {
    check_t = 1;
    socket.emit("typing", $("#inname").text(), check_t);
  } else {
    check_t = 0;
    socket.emit("typing", $("#inname").text(), check_t);
  }
});

$("#m").focusout(function() {
  const check_f = 0;
  socket.emit("typing", $("#inputuse").val(), check_f);
});

socket.on("is_typing", function(name) {
  $("#typing").empty();
  $("#typing").append(name + " is typing ...");
});
socket.on("is_not_typing", function(name) {
  $("#typing").empty();
});
