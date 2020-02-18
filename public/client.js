const constraints = (window.constraints = {
  audio: true,
  video: true
});

const localvideo = document.querySelector("video#local_video");
const uservideo = document.querySelector("video#user_video");
var checkCall= false;

const peer = new Peer({ key: "lwjd5qra8257b9" });
peer.on("open", function() {
  console.log(peer.id);
  socket.emit("peerID", { peerID: peer.id });
});
peer.on("error", function(err) {
  console.log(err);
});

const vb = document.querySelector("button#video_button");
if (vb) {
  vb.addEventListener("click", e => init(e));
}

async function init(e) {// click the video button
  if ($("#inname").html()==null) {
    alert("hey you dont have a name");
  } else if ( $("#inboxuser option:selected").text() == "chat room" ){
    alert("please select friend's name to call");
  } else {
    $("#modal_title").empty();
    $("#modal_title").removeClass().addClass("text-dark").append("Calling");
    socket.emit("calling", $("#inboxuser option:selected").text(), peer.id);//sending peer id to call
    $("#modal_id").modal();    
  }
}

//close modal video
$("#modal_id").on("hidden.bs.modal", function hidden_modal() {
  const stream = localvideo.srcObject;
  if (stream != null) {
    const tracks = stream.getTracks();
    tracks.forEach(function(track) {
      track.stop();
    });
    $("#video_button").prop("disabled", false);
  } else {
    $("#video_button").prop("disabled", false);
  }
});

socket.on("answer_call", function(data, id) {
  $("#modalc").append(data.username + " is calling")
  if(checkCall ==true){
    socket.emit("deny_call", {
      callerName: data.username,
      answerName: data.targetname
    });
  }else{
  var id = id.callID;
  $("#modal_t").modal();
  $("#button_ac").click(function(){
    $("#modal_t").modal("hide");
    $("#modal_id").modal();
    //call
    openStream().then(stream => {
      checkCall =true;
      playStream("local_video", stream);
      console.log("hey " + id);
      const call = peer.call(id, stream);
      call.on("stream", remoteStream => playStream("user_video", remoteStream));
      call.on("close", function() {
        checkCall=false;
        disconnectedNoti();
      });
      $("#modal_id").on("hidden.bs.modal", function() {
        call.close();
      });
    });
    $("#modal_title").empty();
    $("#modal_title").removeClass().addClass("text-success").append(data.username + " has connected");
    socket.emit("accept_call", { callerName : data.username });
  });
  $("#button_de").click( function() {
    socket.emit("deny_call", {
      callerName: data.username,
      answerName: data.targetname
    });
  });
  }
});

//answer call
peer.on("call", call => {
  openStream().then(stream => {
    call.answer(stream);
    playStream("local_video", stream);
    checkCall=true;
    call.on("stream", remoteStream => playStream("user_video", remoteStream));
  });
  call.on("close", function() {
    checkCall=false;
    disconnectedNoti();
  });
  $("#modal_id").on("hidden.bs.modal", function() {
    call.close();
  });
});
//deny call
socket.on("deny_noty", function(data) {
  $("#modal_title").empty();
  $("#modal_title").removeClass().addClass("text-danger").append(data.denyName + " is busy now");
});

//accept call
socket.on("accept_noty", function(data) {
  $("#modal_title").empty();
  $("#modal_title").removeClass().addClass("text-success").append(data.acceptName + " has connected");
});

function openStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}

function disconnectedNoti() {
  $("#endvideo").click();
}

function handleError(error) {
  if (error.name === "ConstraintNotSatisfiedError") {
    const v = constraints.video;
    errorMsg(
      `The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`
    );
  } else if (error.name === "PermissionDeniedError") {
    errorMsg(
      "Permissions have not been granted to use your camera and " +
        "microphone, you need to allow the page access to your devices in " +
        "order for the demo to work."
    );
  }
  errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector("#errorMsg");
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== "undefined") {
    console.error(error);
  }
}