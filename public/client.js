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
  try {
    const streams = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(streams);
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
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
    $("#video_button").prop('disabled', false);
});

const peer = new Peer({key: 'lwjd5qra8257b9'});

peer.on('open', id => console.log(id) ,function(){
  console.log("hle"+id);
  
});


