var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
var list = {};
var ID = {};
io.on("connection", function(socket) {
  io.emit("update", list);
  socket.on("disconnect", function() {
    io.emit("leave", { user: socket.username });
    delete list[socket.username];
    io.emit("update", list);
    //console.log("user: disconnected");
  });

  socket.username = "guest";
  socket.on("changeuser", function(data) {
    delete list[socket.username];
    socket.username = data.username;
    list[data.username] = data.username;
    console.log(list);
    io.emit("changeuser", { user: socket.username });
    io.emit("update", list);
    // console.log("halo: " + data.username);
  });
  socket.on('setSocketId', function(data) {
    var userName = data.name;
    var userId = data.userId;
    ID[userName] = userId;
});
  socket.on("chat message", function(msg) {
    io.emit("chat message", { msg: msg, username: socket.username });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
