const constraints = (window.constraints = {
  audio: true,
  video: true
});

function handleSuccess(stream) {
  const videoTracks = stream.getTracks();
  console.log("Got stream with constraints:", constraints);
  console.log(`Using video device: ${videoTracks[0].label}`);
  window.stream = stream; // make variable available to browser console
  localvideo.srcObject = stream;
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

async function init(e) {
  if ($("#inputuse").val() == "") {
    alert("hey");
  } else if (
    $("#inputuse").val() == $("#inboxuser option:selected").text() ||
    $("#inboxuser option:selected").text() == "chat room"
  ) {
    alert("ayyyyyyyyyy ban eeeee");
  } else {
    socket.emit("calling", $("#inboxuser option:selected").text(), peer.id);
    $("#modal_id").modal();
    // try {
    //   const streams = await navigator.mediaDevices.getUserMedia(constraints);
    //   handleSuccess(streams);
    //   e.target.disabled = true;
    // } catch (e) {
    //   handleError(e);
    // }
  }
}
const localvideo = document.querySelector("video#local_video");
const vb = document.querySelector("button#video_button");
if (vb) {
  vb.addEventListener("click", e => init(e));
}

$("#modal_id").on("hidden.bs.modal", function() {
  const stream = localvideo.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(function(track) {
    track.stop();
  });
  $("#video_button").prop("disabled", false);
});

const peer = new Peer({ key: "lwjd5qra8257b9" });
peer.on("open", function() {
  console.log(peer.id);
  socket.emit("peerID", { peerID: peer.id });
});
peer.on("error", function(err) {
  console.log(err);
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

socket.on("answer_call", function(data, id) {
  var id = id.callID;
  var r = confirm(data.username + " is calling");
  if (r == true) {
    $("#modal_id").modal();
    //call
    openStream().then(stream => {
      playStream("local_video", stream);
      const call = peer.call(id, stream);
      console.log("hey " + id);
      call.on("stream", remoteStream => playStream("user_video", remoteStream));
    });
    $("#modal_title").empty();
    $("#modal_title").append("connected");
  } else {
    socket.emit("deny_call", {
      callerName: data.username,
      answerName: data.targetname
    });
  }
});

//answer call
peer.on("call", call => {
  console.log("aaaaaaa");
  openStream().then(stream => {
    call.answer(stream);
    playStream("local_video", stream);
    call.on("stream", remoteStream => playStream("user_video", remoteStream));
  });
});
//deny call
socket.on("deny_noty", function(data) {
  $("#modal_title").empty();
  $("#modal_title").append(data.denyName + " has refused the call from you");
});
