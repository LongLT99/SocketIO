var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.set("public","");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
var list = {};
var ID = {};
var room = {};
var mem = {};
var roomID='';
io.on("connection", function(socket) {
  io.emit("update", list);
  io.emit("getID", ID);
  socket.on("disconnect", function() {
    io.emit("leave", { user: socket.username });
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
    // console.log(list);
    io.emit("changeuser", { user: socket.username });
    io.emit("update", list);
    // console.log("halo: " + data.username);
  });

  socket.on("setSocketId", function(data) {
    var userName = data.name;
    var userId = data.userId;
    ID[userName] = userId;
    // console.log(userName+" "+userId);
  });
  socket.on("setRoom",function(data){
        socket.RoomName = data.roomName;
        if(room[socket.RoomName]== null){// chua co room
          console.log("check1"+socket.RoomName);
          room[data.roomName]= data.roomName;
          socket.join(data.roomName);
          mem[socket.RoomName]=data.username;
        }
        else{
          console.log("check2"+socket.RoomName);
          room[socket.RoomName]=data.roomName;
          socket.join(data.roomName);
          mem[socket.RoomName]=data.username;
        }
        console.log(socket.RoomName); 
      }) 

  // socket.on("postname", function(data) {
  //   var toName = data.toname;
  //   // console.log(toName);
  // });
  socket.on("chat message 1", function(msg) {
    io.to(room[socket.RoomName]).emit("chat message", { msg: msg, username: socket.username });
  });
  socket.on("private message",function(toname,msg){
    io.to(ID[socket.username]).emit("chat private", {msg: msg, username: socket.username },{touser: toname});
    io.to(ID[toname]).emit("chat private", {msg: msg, username: socket.username },{touser: toname});
  })
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
