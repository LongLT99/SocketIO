var socket = io();
$("#send_button").click(function() {
  $("form").submit();
});
$("form").submit(function(e) {
  if($("#m").val()!=""){// not empty mess
    if ($("#chat-type option:selected").text() == "chat room") {
      if($("#room_name option:selected").text() != "" && $("#rname").html()!=""){
        e.preventDefault(); // prevents page reloading
        socket.emit("send_to_room", $("#m").val());
      }else{
        $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("you need in a room to chat room !!!");
      }
    }else if ($("#chat-type option:selected").text() == "chat all") {
      e.preventDefault();
      socket.emit("send_to_all", $("#m").val());
    }
    else {
      if($("#inboxuser option:selected").text()!="Choose friends ..."){
        e.preventDefault(); 
        socket.emit( "private message", $("#inboxuser option:selected").text(), $("#m").val() ); // private mess
      }else{
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

$("#buton").click(function() {//create user
  // user name
  if ($("#inputuse").val() == "") {
    $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("Please enter your name !!!");
  } else {
    socket.emit("setSocketId", { name: $("#inputuse").val(), userId: socket.id }); //send username +id ->setSocketId
    socket.emit("changeuser", { username: $("#inputuse").val() }); // send username -> changeuser
  }
  $("#inputuse").val("");
});

socket.on('room_alert',function(room){
  $("#noname").modal();
  $("#alert_no").empty();
  $("#alert_no").append("already had room name : "+ room.room_name);
});

//room
$("#roomb").click(function() {//create room
  if($('#inname').html()==null){
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("you must create user name fist to create room !!!");
  }else{
    if ($("#in_room").val() == "") {
      $("#noname").modal();
      $("#alert_no").empty();
      $("#alert_no").append("please enter room's name");
    }else {
      var pass = prompt("enter your room password");
      if(pass!=null && pass!=""){
        socket.emit("setRoom", { roomName: $("#in_room").val(), username: $("#inputuse").val(), pass_room : pass });//sending room password
        $("#in_room").val("");  
      }else{
        $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("create room fail");
      }
    }
  }
});

socket.on('name_alert',function(name){
  $("#noname").modal();
  $("#alert_no").empty();
  $("#alert_no").append(name.taken_name + " is taken. Try another");
});

$("#roomj").click(function() {
  if($("#room_name").val()==""){
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("there is no room please create one");
  }else if($('#inname').html() == null){
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("you must create user name fist to join room !!!");
  }else{    
    var passr = prompt("enter room's password please ");
    if(passr!=null){
      socket.emit("joinRoom", { roomName: $("#room_name").val(), username: $("#inputuse").val(), room_pass : passr });
    }else{
      $("#noname").modal();
      $("#alert_no").empty();
      $("#alert_no").append("join room fail !!!");
    }
  }
});

socket.on('join_alert',function(data){
  $("#noname").modal();
  $("#alert_no").empty();
  $("#alert_no").append("wrong password of room : "+data.room_name);
})

socket.on("list_room", function(room) {
  //up date room name
  $("#room_name").focus(function(){
    $("#room_name").empty();
    $.each(room, function(rname) {
      $("#room_name").append("<option>" + rname + "</option>");
    });
  });
});

socket.on("list_yroom", function(room, namer){
  $("#room_name").focus(function(){
    $("#room_name").empty();
    $.each(room, function(rname) {
      $("#room_name").append("<option>" + rname + "</option>");
    });
  });
  $("#success").modal();
  $("#alert_su").empty();
  $("#alert_su").append("now you in room " + namer);
  //show room info
  $("#room_info").show();
  $("#rname").remove();
  $("#room_info").append('<span id ="rname"> '+ namer +'</span>');
  $("#room_name").append("<option>" + namer + "</option>");
  $("#room_name").val(namer);
});

socket.on("change_user", function(data) {
  $("#messages").append("<li>" + data.user + " is connect"); // connected user notication
  socket.on("update", function(list) {// update online user
    $("#online_user").empty();
    $.each(list, function(username) {
      $("#online_user").append("<li>" + username);
    });
    //update list user to select user
    $("#inboxuser").focus(function(){
      $("#inboxuser").empty();
      $("#inboxuser").append("<option>Choose friends ...</option>");
      $.each(list, function(username) {
        if(username.localeCompare($('#inname').text().trim())!=0){
          $("#inboxuser").append("<option>" + username + "</option>");
        }
      });
    });
    //update user for chat call
    $("#add_g").empty();
    $("#add_g").append("<option> Choose friend to call</option>");
    for(x in list){
      if(x.localeCompare($('#inname').text().trim())!=0){
        $("#add_g").append("<option>"+x+"</option>");
      }
    }
  });
});

socket.on("get_info",function(data){// show info user to menu bar
  $("#info").show();
  $("#inname").remove();
  $("#info").append('<span id ="inname"> '+ data.user +'</span>');
})

socket.on("leave", function(user, room) {
  $("#messages").append("<li>" + user + " is disconnect"); // disconnected user notication
  $("#room_name").empty();
  $.each(room, function(username) {
    $("#room_name").append("<option>" + username + "</option>");
  });
});

socket.on("send_to_clien", function(data) {// chat room
  $("#messages").append("<li>" + data.username + ": " + data.msg); // send message
  $("#cbox").scrollTop($("#messages").height());
});

socket.on("chat_all", function(data){// chat all
  $("#messages").append("<li>" + data.username + " to all : " + data.msg);
  $("#cbox").scrollTop($("#messages").height());
});

socket.on("chat private", function(data, to) {// caht private
  $("#privates").append("<li> from " + data.username + " to " + to.touser + ": " + data.msg); // send private message
  $("#ibox").scrollTop($("#ibox").height());
  $("#refresh").click(function() {// refresh button
    $("#privates").empty();
  });
});

// chat emoji
var iconid = 128512;
$('#icon_button').click(function(){
  while(iconid < 128592){  
    $("#emoji").append('<button type="button" id="icon_' + iconid + '" class="btn btn-light" style="width:20%; font-size:x-large" onclick="pick_emoji(\icon_' + iconid + '\)">&#' + iconid +';</button>');
    iconid +=1;
  }
});

function pick_emoji(emoji) {
  $("#m").val($("#m").val() + $(emoji).html()).focus();
};