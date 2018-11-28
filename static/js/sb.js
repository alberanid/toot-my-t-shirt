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
    var video = document.querySelector("video");
    video.width = video.offsetWidth;
    video.onloadedmetadata = function() {
        video.play();
    };
    video.srcObject = stream;
}


function sendData(data) {
    var xhr = new XMLHttpRequest();
    var boundary = "youarenotsupposedtolookatthis";
    var formData = new FormData();
    formData.append("selfie", new Blob([data]), "selfie.jpeg");
    fetch("/publish/", {
        method: "POST",
        body: formData
    }).then(function(response) {
        if (response.status !== 200) {
            console.log("something went wrong sending the data: " + response.status);
        } else {
            console.log("photo was sent successfully");
        }
        cancelPhoto();
    }).catch(function(err) {
        console.log("something went wrong connecting to server: " + err);
        cancelPhoto();
    });
}


function cancelPhoto() {
    console.log("cancel photo");
    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    countdown.stop();
}


function updateSendCountdown() {
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
    var canvas = document.querySelector("canvas");
    if (isBlank(canvas)) {
        console.log("cowardly refuse to send a blank image.")
        return;
    }
    return sendData(canvas.toDataURL("image/jpeg"));
}


function takePhoto() {
    console.log("take photo");
    var video = document.querySelector("video");
    var canvas = document.querySelector("canvas");
    var tmpCanvas = document.createElement("canvas");

    tmpCanvas.width = video.offsetWidth;
    tmpCanvas.height = video.offsetHeight;

    var tmpContext = tmpCanvas.getContext("2d");
    var tmpRatio = (tmpCanvas.height / tmpCanvas.width);
    tmpContext.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.style.height = parseInt(canvas.offsetWidth * tmpRatio);
    var context = canvas.getContext("2d");
    var scale = canvas.width / tmpCanvas.width;
    context.scale(scale, scale);
    context.drawImage(tmpCanvas, 0, 0);
    countdown.start(5, cancelPhoto, updateSendCountdown);
}


function initCamera() {
    console.log("request camera permission");
    var videoObj = {
        "video": {
            width: 800,
            height: 600
        },
        "audio": false
    };

    navigator.mediaDevices.getUserMedia(videoObj).then(function(stream) {
        runCamera(stream);
    }).catch(function(err) {
        console.log("unable to open camera");
        console.log(err);
    });
}

