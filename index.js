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
  socket.on("postname", function(data) {
    var toName = data.toname;
    // console.log(toName);
  });
  socket.on("chat message", function(msg) {
      io.emit("chat message", { msg: msg, username: socket.username });
    // console.log("check"+ID[toname]);
  });
  socket.on("private message",function(toname,msg){
    io.to(ID[socket.username]).emit("chat private", {msg: msg, username: socket.username },{touser: toname});
    io.to(ID[toname]).emit("chat private", {msg: msg, username: socket.username },{touser: toname});
  })
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
