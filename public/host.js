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
      //host mana
      $("#host_body").empty();
      $("#host_body").append('<a href="#" class="list-group-item list-group-item-action">'+host+ '   <img id="host_img" src="/img/crown.png" ></a>');
      for(x in MRoom){
        if(x.localeCompare(host)!=0){
          $("#host_body").append('<a href="#" class="list-group-item list-group-item-action">'+x+'</a>');
        }
      }
    }else{
        $("#host_room").show();
        MRoom ={};
        MRoom[host]= host;
        $("#room_mem").empty();
        $("#room_mem").append("<li>" + host + '   <img id="host_img" src="/img/crown.png" >');
        //host mana
        $("#host_body").empty();
        $("#host_body").append('<a href="#" class="list-group-item list-group-item-action">'+host+ '   <img id="host_img" src="/img/crown.png" ></a>');
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

    $("#host_body").empty();
    $("#host_body").append('<a href="#" class="list-group-item list-group-item-action">'+host+ '   <img id="host_img" src="/img/crown.png" ></a>');
    for(x in MRoom){
      if(x.localeCompare(host)!=0){
        $("#host_body").append('<a href="#" class="list-group-item list-group-item-action">'+x+'</a>');
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

$("#host_room").click(function(){
    $("#modal_h").modal();
});