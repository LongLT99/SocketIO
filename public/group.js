var call ={};
var caller = {};
$("#group").click(function(){// start video call group 
    if($("#inname").html()==null){
        alert("you need a name to call !!!")
    }else{
        $("#modal_g").modal();
        $("#add").click(function(){
            if($("#inname").text().trim().localeCompare($("#add_n").val())!=0){
                call[$("#inname").text().trim()]=peer.id;// call= {name : peer id}//list peer id by name
                caller[$("#inname").html().trim()] = $("#inname").html().trim();// list members in group videocall
                socket.emit("add_call",$("#add_n").val(), caller, call);
            }else{
                $("#noname").modal();
                $("#alert_no").empty();
                $("#alert_no").append("<p>you can not call yourself</p>");
            }
        });
    }
});

socket.on('g_call',function(caller,call, id){
    $("#alert_g").empty();
    $("#alert_g").append("<p>from :</p>")
    $.each(caller, function(callname) {
        if(callname.localeCompare($('#inname').text().trim())!=0){
            $("#alert_g").append("<span> " + callname + ",</span>");
        }        
    });
    $("#modal_cg").modal();
    $("#b_ac").click(function(){ //accepct group call
        caller[$('#inname').text().trim()]=$('#inname').text().trim();// add new member
        call[$('#inname').text().trim()]=id;// add new peer id
        socket.emit("new_mem",caller,$('#inname').text().trim());
        $("#modal_cg").modal("hide");
        $("#modal_g").modal();
        socket.emit("to_mem", caller, $('#inname').text().trim());//send new mem name to mems     
    });
});

socket.on('up_info',function(name,id){// update info for old members
    call[name]=id;
    caller[name]=name;
    $("#add_n").val("");
});

socket.on("no_name", function(name){//wrong name alert
    $("#alert_no").empty();
    $("#alert_no").append("There is no user name : "+name );
    $("#noname").modal();
    $("#add_n").val("");   
});

socket.on("up_mem",function(id){
            addvideo(id);
            openStream().then(stream => {
                checkCall =true;
                playStream("local_vi", stream);
                const call = peer.call(id, stream);
                call.on("stream", remoteStream => playStream(id, remoteStream));
                call.on("close", function() {
                  checkCall=false;
                });
                $("#modal_g").on("hidden.bs.modal", function() {
                  call.close();
                  $("#videoc").empty();
                });
              });
});

function addvideo(peer){
    if (!$("#" + peer).length) {
        $("#videoc").append('<div class="col" >' +
          '<video id="' + peer + '" class="col px-0" autoplay playsinline style="width: 50%;"></video>' +
          '</div>')  
    }
}