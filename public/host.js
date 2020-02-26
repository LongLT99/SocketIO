socket.on("list_mem", function(MRoom, host, checkout){
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
        $("#host_room").show();
        MRoom ={};
        MRoom[host]= host;
        $("#room_mem").empty();
        $("#room_mem").append("<li>" + host + '   <img id="host_img" src="/img/crown.png" >');
    }
});

socket.on('new_mem_to_room', function(data){
    MRoom[data.memname] = data.memname;
    socket.emit('send_info_to_room',MRoom, data.host);
});

var MemList = {};
socket.on('get_from_host',function(MRoom, host){
    console.log(MRoom);// ko xoa
    MemList = MRoom;
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
    for(x in MemList){
      if(x.localeCompare(host)!=0){
        socket.emit("new_host", x, room, host, MemList);
        break;
      }
    }
});

socket.on("host_out_room", function(old_host, MemList, host){
    $("#success").modal();
    $("#alert_su").empty();
    $("#alert_su").append("now you are host !!!");//change host success
    $("#host_room").show();
    MRoom = MemList;
    delete MRoom[old_host];
    socket.emit('send_info_to_room',MRoom, host);
});

$("#alert_su").on("hidden.bs.modal", function hidden_modal() {
    $("#room_name").focus(function(){
        $("#room_name").empty();
        $.each(room, function(rname) {
          $("#room_name").append("<option>" + rname + "</option>");
        });
      });
});