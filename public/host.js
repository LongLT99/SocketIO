socket.on("list_mem", function(MRoom, host, checkout){
    console.log(checkout);
    if(checkout==0){
      $("#host_room").show();
      $("#room_mem").empty();
      $("#room_mem").append("<li>" + host + '   <img id="host_img" src="/img/crown.png" >');
      for(x in MRoom){
        if(x.localeCompare(host)!=0){
          $("#room_mem").append("<li>" + x);
        }
      }
    }else{
      MRoom ={};
      MRoom[host]= host;
      $("#room_mem").empty();
      $("#room_mem").append("<li>" + host + '   <img id="host_img" src="/img/crown.png" >');
    }
});

socket.on('new_mem_to_room', function(data){
    console.log(MRoom);
    MRoom[data.memname] = data.memname;
    socket.emit('send_info_to_room',MRoom, data.host);
});

var MemList = {};
socket.on('get_from_host',function(MRoom, host){
    console.log(MRoom);
    MemList = MRoom;
    console.log(MemList);
    $("#room_mem").empty();
    $("#room_mem").append("<li>" + host + '   <img id="host_img" src="/img/crown.png" >');
    for(x in MemList){
      if(x.localeCompare(host)!=0){
        $("#room_mem").append("<li>" + x);
      }
    }
});

socket.on('mem_out_room', function(data){
    delete MRoom[data.memname];
    socket.emit('send_info_to_room',MRoom,data.host);
});

socket.on('change_host', function(host, room){
    $("#host_room").hide();
    console.log(MemList);
    // delete MemList[host];
    // MRoom = MemList;
    for(x in MemList){
      if(x.localeCompare(host)!=0){
        socket.emit("new_host", x, room, host, MemList);
        break;
      }
    }
});

socket.on("host_out_room", function(old_host, MRoom, host){
    $("#host_room").show();
    MRoom = MemList;
    delete MRoom[old_host];
    socket.emit('send_info_to_room',MRoom, host);
});