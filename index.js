var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("public", "");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

var list = {};
var ID = {};
var room = {};
var pass = {};
var mem = [];
io.on("connection", function(socket) {
  io.emit("update", list);
  io.emit("getID", ID);
  socket.on("disconnect", function() {
    mem[socket.RoomName] -= 1;
    console.log(mem[socket.RoomName]);
    delete_room(socket.RoomName);
    io.emit("leave", socket.username, room);
    delete list[socket.username];
    delete ID[socket.username];
    io.emit("update", list);
    io.emit("getID", ID);
    //console.log("user: disconnected");
  });

  socket.username = "guest";
  socket.RoomName = "guest";

  socket.on("changeuser", function(data) {
    delete list[socket.username];
    delete ID[socket.username];
    socket.username = data.username;
    list[data.username] = data.username;
    io.emit("changeuser", { user: socket.username });
    socket.emit('list_room',room); 
    io.emit("update", list);
  });

  socket.on("setSocketId", function(data) {
    var userName = data.name;
    var userId = data.userId;
    ID[userName] = userId;
    // console.log(userName+" "+userId);
  });

  socket.on("setRoom", function(data) {
    socket.RoomName = data.roomName;
    if (room[socket.RoomName] == null) {
      // chua co room
      room[data.roomName] = data.roomName;
      pass[data.roomName] = data.pass_room;
      socket.join(data.roomName);
      mem[socket.RoomName] = 1;
      socket.emit('list_room',room);    
      socket.broadcast.emit('list_room',room);    

    } else {// trung ten room
      io.to(ID[data.username]).emit('room_alert',{room_name : data.roomName});
    }
  });
  socket.on("joinRoom", function(data){
      if(data.room_pass.localeCompare(pass[data.roomName])==0){
        mem[socket.RoomName] -= 1;
        delete_room(socket.RoomName);
        socket.RoomName = data.roomName;        
        socket.join(data.roomName);
        mem[socket.RoomName] += 1;
        console.log(mem[socket.RoomName]);        
    }else{
      io.to(ID[data.username]).emit('join_alert',{room_name : data.roomName});
    }
  });

  socket.on("send_chat_mess_to_sever", function(msg) {
    io.to(room[socket.RoomName]).emit("send_chat_mess_to_clien", {
      msg: msg,
      username: socket.username
    });
  });

  function delete_room(name){
    if(mem[name]==0){
      delete room[name];
      socket.emit('list_room',room); 
    }
  }

  socket.on("private message", function(toname, msg) {
    io.to(ID[socket.username]).emit( "chat private", { msg: msg, username: socket.username }, { touser: toname } );
    io.to(ID[toname]).emit( "chat private", { msg: msg, username: socket.username }, { touser: toname } );
  });

  socket.on("calling", function(target, peerID) {//get peerid from the caller
    io.to(ID[target]).emit( "answer_call", { username: socket.username, targetname: target }, { callID: peerID } );
  });

  socket.on("accept_call", function(data) {
    io.to(ID[data.callerName]).emit("accept_noty", { acceptName: socket.username });
  });

  socket.on("deny_call", function(data) {
    io.to(ID[data.callerName]).emit("deny_noty", { denyName: data.answerName });
  });

  socket.on("end_call", function(data){
    console.log("a"+data.end);
    io.to(ID[data.ended]).emit("end_noty",{endName : data.end});
  });
});

http.listen(process.env.PORT || 3000, function() {
  console.log("listening on *:3000");
});
