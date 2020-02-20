var call ={};
var caller = {};
$("#group").click(function(){ 
    if($("#inname").html()==null){
        alert("you need a name to call !!!")
    }else{
        $("#modal_g").modal();
        $("#add").click(function(){
            call[$("#inname").text().trim()]=peer.id;
            caller[$("#inname").html().trim()] = $("#inname").html().trim();
            socket.emit("add_call",$("#add_n").val(), caller, call);
        });
    }
})
var idc;
var idd;
socket.on('g_call',function(caller,call, id){
    $("#alert_g").empty();
    $.each(caller, function(callname) {
        if(callname.localeCompare($('#inname').text().trim())!=0){
            $("#alert_g").append("<span> " + callname + "</span>");
        }        
    });
    idc= 0;
    $("#modal_cg").modal();
    $("#b_ac").click(function(){
        addvideo(idc+1);      
        caller[$('#inname').text().trim()]=$('#inname').text();
        call[$('#inname').text().trim()]=id;
        $("#modal_cg").modal("hide");
        $("#modal_g").modal();
        idd=0;
        // for(x in call ){
        //     if(x.localeCompare($('#inname').text().trim())!=0){
        //         console.log(call[x]);
        //         idd = call[x];
        //         if(idc<5){
        //             idc+=1;
        //         }else{
        //             idc=1;
        //         }
        //         console.log(idc);
        //         if(idd!=0){
        //             openStream().then(stream => {
        //                 checkCall =true;
        //                 playStream("local_vi", stream);
        //                 const call = peer.call(idd, stream);
        //                 call.on("stream", remoteStream => playStream(idc, remoteStream));
        //                 call.on("close", function() {
        //                   checkCall=false;
        //                   disconnectedNoti();
        //                 });
        //                 $("#modal_g").on("hidden.bs.modal", function() {
        //                   call.close();
        //                 });
        //               });
        //         }     
        //     }
        // }
        for(x in call){
            if(x.localeCompare($('#inname').text().trim())!=0){
                socket.emit("to_mem",$('#inname').text().trim(),x);                 
            }
        }       
    });
});

socket.on('pull_peer', function(name,id){
    call[name]=id;
    caller[name]=name;
    console.log(call); 
    $("#add_n").val("");
    console.log(caller);
});

socket.on("no_name", function(name){//wrong name alert
    $("#alert_no").append("There is no user name :"+name );
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
                  disconnectedNoti();
                });
                $("#modal_id").on("hidden.bs.modal", function() {
                  call.close();
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