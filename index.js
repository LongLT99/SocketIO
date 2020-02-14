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
    delete_room(socket.RoomName);
    io.emit("leave", socket.username, room);
    delete list[socket.username];
    delete ID[socket.username];
    io.emit("update", list);
    io.emit("getID", ID);
  });

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  socket.username = "guest"+getRandomInt(10000);
  socket.RoomName = "guest";

  socket.on("changeuser", function(data) {// create user button
    if(list[data.username]==null){
      delete list[socket.username];
      delete ID[socket.username];
      socket.username = data.username;
      list[data.username] = data.username;
      io.emit("change_user", { user: socket.username });
      io.to(ID[socket.username]).emit("get_info",{ user: socket.username });
      io.to(ID[socket.username]).emit("list_friends", list, ID[socket.username]);
      socket.emit('list_room',room); 
      io.emit("update", list);
    }else{
      socket.emit('name_alert',{taken_name : data.username});
    }
  });
  socket.on("setSocketId", function(data) {//get socket id
    var userName = data.name;
    var userId = data.userId;
    ID[userName] = userId;
  });

  socket.on("setRoom", function(data) {
    socket.RoomName = data.roomName;
    if (room[socket.RoomName] == null) {//usename is not taken
      room[data.roomName] = data.roomName;
      pass[data.roomName] = data.pass_room;
      socket.join(data.roomName);
      mem[socket.RoomName] = 1;
      socket.emit('list_room',room);   // sending to sender
      socket.broadcast.emit('list_room',room);   // sending to all clients except sender 
    } else {// room name is taken. Try another
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
    }else{     
      io.to(ID[socket.username]).emit('join_alert',{room_name : data.roomName});
    }
  });

  socket.on("send_to_room", function(msg) {
    io.to(room[socket.RoomName]).emit("send_to_clien", { msg: msg, username: socket.username });// send message to room member
  });
  socket.on("send_to_all", function(msg){
    socket.emit('chat_all',{ msg: msg, username: socket.username });   
    socket.broadcast.emit('chat_all',{ msg: msg, username: socket.username });
  });

  function delete_room(name){
    if(mem[name]==0){
      delete room[name];
      socket.emit('list_room',room); 
    }
  }

  socket.on("private message", function(toname, msg) {// send private message to target friend
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
    io.to(ID[data.ended]).emit("end_noty",{endName : data.end});
  });
  socket.on('typing', function(name,t){
    if(t==1){
      socket.broadcast.emit('is_typing',name);
    }else{
      socket.broadcast.emit('is_not_typing',name);
    }
  });
});

http.listen(process.env.PORT || 3000, function() {
  console.log("listening on *:3000");
});
