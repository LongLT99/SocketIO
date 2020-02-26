var MRoom = {};
var host_check;
var checkout;
//create room
$("#roomb").click(function() {
    if($('#inname').html()==null){// no username error
      $("#noname").modal();
      $("#alert_no").empty();
      $("#alert_no").append("you must create user name fist to create room !!!");
    }else{

      if ($("#in_room").val() == "") {// no roomname error
        $("#noname").modal();
        $("#alert_no").empty();
        $("#alert_no").append("please enter room's name");
      }else {
        var pass = prompt("enter your room password");
        if(pass!=null && pass!=""){//ok    
          if($("#rname").html()==null){
            checkout=0;
          }else{
            checkout=1;
          }
          MRoom[$("#inname").html().trim()]=$("#inname").html().trim();
          socket.emit("setRoom", { roomName: $("#in_room").val(), username: $("#inname").html().trim(), pass_room : pass, MRoom, checkout});//sending room password
          $("#in_room").val("");
        }else{//cancer
          $("#noname").modal();
          $("#alert_no").empty();
          $("#alert_no").append("create room fail");
        }

      }

    }

});

socket.on('room_alert',function(room){
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("already had room name : "+ room.room_name);
});

socket.on("list_yroom", function(room, namer){
  //update room
  $("#room_name").focus(function(){
    $("#room_name").empty();
    $.each(room, function(rname) {
      $("#room_name").append("<option>" + rname + "</option>");
    });
  });
  //success modal
  $("#success").modal();
  $("#alert_su").empty();
  $("#alert_su").append("now you in room " + namer);//create room success
  //show room info
  $("#room_info").show();
  $("#rname").remove();
  $("#room_info").append('<span id ="rname"> '+ namer +'</span>');
  $("#room_name").append("<option>" + namer + "</option>");
  $("#room_name").val(namer);
});

socket.on("list_room", function(room) {
  //up date room name
  $("#room_name").focus(function(){
    $("#room_name").empty();
    $.each(room, function(rname) {
      $("#room_name").append("<option>" + rname + "</option>");
    });
  });
});
  
$("#roomj").click(function() {//join room
  if($("#room_name").val()==""){//no room error
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("there is no room please create one");
  }else if($('#inname').html() == null){//no user name error
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("you must create user name fist to join room !!!");
  }else if($('#rname').html()!=null && $("#room_name").val()==$('#rname').html().trim()){//Already in room error
    $("#noname").modal();
    $("#alert_no").empty();
    $("#alert_no").append("Already in room "+$('#rname').html().trim());
  }else{    
    var passr = prompt("enter room's password please ");
    if(passr!=null){//ok
      socket.emit("joinRoom", { roomName: $("#room_name").val(), username: $("#inputuse").val(), room_pass : passr });
    }else{//cancer
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
});

$("#change").click(function(){
  if($("#change").val()=="room"){
    // change tittle
    $("#mem_title").empty();
    $("#mem_title").append("Room members");
    // change list
    $("#change").val("sever");
    $("#online_user").hide();
    $("#room_mem").show();
    if($("#room_mem").val()=="" && $("#inname").html()!=null && $("#rname").html()==null){
      $("#room_mem").empty();
      $("#room_mem").append('<li class ="text-warning" > you not in any room yet !!!');
    }
  }else{
    // change tittle
    $("#mem_title").empty();
    $("#mem_title").append("Online user");
    // change list
    $("#change").val("room");
    $("#room_mem").hide();
    $("#online_user").show();
  }
});