var countdown = {
    _timeout: null,
    _stepCb: null,
    _timeoutCb: null,
    running: false,
    seconds: 5,
    _initial_seconds: 5,

    start: function(seconds, timeoutCb, stepCb) {
        countdown.stop();
        countdown.seconds = countdown._initial_seconds = seconds || 5;
        countdown._timeoutCb = timeoutCb || countdown._timeoutCb;
        countdown._stepCb = stepCb || countdown._stepCb;
        countdown.running = true;
        countdown._step();
    },

    stop: function() {
        if (countdown._timeout) {
            window.clearTimeout(countdown._timeout);
        }
        countdown.running = false;
    },

    restart: function() {
        countdown.start(countdown._initial_seconds);
    },

    _step: function() {
        if (countdown._stepCb) {
            countdown._stepCb();
        }
        if (countdown.seconds === 0) {
            if (countdown._timeoutCb) {
                countdown._timeoutCb();
            }
            countdown.stop();
        } else {
            countdown._decrement();
        }
    },

    _decrement: function() {
        countdown.seconds = countdown.seconds - 1;
        countdown._timeout = window.setTimeout(function() {
            countdown._step();
        }, 1000);
    }
};


function runCamera(stream) {
    console.log("initialize the camera");
    var video = document.querySelector("#sb-video");
    var container = document.querySelector("#canvas-container");
    container.width = video.videoWidth;
    video.onloadedmetadata = function() {
        video.play();
    };
    video.srcObject = stream;
}


function sendData(data) {
    var xhr = new XMLHttpRequest();
    var boundary = "youarenotsupposedtolookatthis";
    var formData = new FormData();
    var msg = "";
    formData.append("selfie", new Blob([data]), "selfie.jpeg");
    fetch("/publish/", {
        method: "POST",
        body: formData
    }).then(function(response) {
        if (response.status !== 200) {
            msg = "something went wrong sending the data: " + response.status;
            console.log(msg);
            M.toast({"html": msg});
        } else {
            msg = "photo was sent successfully!";
            console.log(msg);
            M.toast({"html": msg});
        }
        cancelPhoto();
    }).catch(function(err) {
        msg = "something went wrong connecting to server: " + err;
        console.log(msg);
        M.toast({"html": msg});
        cancelPhoto();
    });
}


function cancelPhoto() {
    console.log("cancel photo");
    document.querySelector("#sb-message").style.visibility = "hidden";
    document.querySelector("#send-photo-btn").classList.add("disabled");
    document.querySelector("#cancel-photo-btn").classList.add("disabled");
    var canvas = document.querySelector("#sb-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    countdown.stop();
}


function updateSendCountdown() {
    document.querySelector("#sb-countdown").innerText = "" + countdown.seconds;
    console.log("deleting photo in " + countdown.seconds + " seconds");
}


function isBlank(canvas) {
    var blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() == blank.toDataURL();
}


function sendPhoto() {
    console.log("send photo");
    countdown.stop();
    document.querySelector("#sb-message").style.visibility = "hidden";
    var canvas = document.querySelector("#sb-canvas");
    if (isBlank(canvas)) {
        var msg = "I cowardly refuse to send a blank image.";
        console.log(msg)
        M.toast({"html": msg});
        return;
    }
    return sendData(canvas.toDataURL("image/jpeg"));
}


function takePhoto() {
    console.log("take photo");
    document.querySelector("#sb-message").style.visibility = "visible";
    var video = document.querySelector("#sb-video");
    var canvas = document.querySelector("#sb-canvas");
    var context = canvas.getContext("2d");
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
 
    /*
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = video.offsetWidth;
    tmpCanvas.height = video.offsetHeight;

    var tmpContext = tmpCanvas.getContext("2d");
    var tmpRatio = (tmpCanvas.height / tmpCanvas.width);
    tmpContext.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.style.height = parseInt(canvas.offsetWidth * tmpRatio);
    var scale = canvas.width / tmpCanvas.width;
    context.scale(scale, scale);
    context.drawImage(tmpCanvas, 0, 0);
    */
    context.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
    document.querySelector("#send-photo-btn").classList.remove("disabled");
    document.querySelector("#cancel-photo-btn").classList.remove("disabled");
    countdown.start(5, cancelPhoto, updateSendCountdown);
}


function initCamera() {
    console.log("request camera permission");
    document.querySelector("#canvas-container").style.display = "block";
    var videoObj = {
        "video": {
            width: 800,
            height: 600
        },
        "audio": false
    };

    navigator.mediaDevices.getUserMedia(videoObj).then(function(stream) {
        runCamera(stream);
        document.querySelector("#init-btn").style.display = "none";
        document.querySelector("#take-photo-btn").classList.remove("disabled");
    }).catch(function(err) {
        console.log("unable to open camera");
        console.log(err);
        M.toast({"html": "unable to open camera; please reload this page: " + err});
    });
}

