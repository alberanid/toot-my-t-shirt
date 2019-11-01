var Countdown = {
    _timeout: null,
    _stepCb: null,
    _timeoutCb: null,
    running: false,
    seconds: 5,
    _initial_seconds: 5,

    start: function(seconds, timeoutCb, stepCb) {
        Countdown.stop();
        Countdown.seconds = Countdown._initial_seconds = seconds || 5;
        Countdown._timeoutCb = timeoutCb || Countdown._timeoutCb;
        Countdown._stepCb = stepCb || Countdown._stepCb;
        Countdown.running = true;
        Countdown._step();
    },

    stop: function() {
        if (Countdown._timeout) {
            window.clearTimeout(Countdown._timeout);
        }
        Countdown.running = false;
    },

    restart: function() {
        Countdown.start(Countdown._initial_seconds);
    },

    _step: function() {
        if (Countdown._stepCb) {
            Countdown._stepCb();
        }
        if (Countdown.seconds === 0) {
            if (Countdown._timeoutCb) {
                Countdown._timeoutCb();
            }
            Countdown.stop();
        } else {
            Countdown._decrement();
        }
    },

    _decrement: function() {
        Countdown.seconds = Countdown.seconds - 1;
        Countdown._timeout = window.setTimeout(function() {
            Countdown._step();
        }, 1000);
    }
};


function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

var UUID = uuidv4();

function getWSPath() {
    var loc = window.location, new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    } else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.host + "/ws?uuid=" + UUID;
    return new_uri;
}


var WS = new WebSocket(getWSPath(), ['soap', 'xmpp']);

WS.onerror = function(error) {
    console.log('WebSocket Error ' + error);
};


WS.onmessage = function(e) {
    console.log("received message on websocket: " + e.data);
    var jdata = JSON.parse(e.data);
    if (!(jdata && jdata.source == "button" && jdata.action == "clicked")) {
        return;
    }
    if (!Countdown.running) {
        takePhoto("press again to publish!");
    } else {
        sendPhoto();
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
    resizeCanvas(video, 'sb-canvas');
}


function sendData(data) {
    var formData = new FormData();
    var msg = "";
    formData.append("selfie", new Blob([data]), "selfie.jpeg");
    fetch("/publish/", {
        method: "POST",
        body: formData
    }).then(function(response) {
        if (response.status !== 200) {
            msg = response.status;
            console.log(msg);
            iziToast.error({
                "title": "😭 something wrong sending the data 😭",
                "message": msg,
                "titleSize": "3em",
                "messageSize": "2em",
                "close": false,
                "drag": false,
                "pauseOnHover": false,
                "position": "topCenter"
            });
        }
        cancelPhoto();
        return response.json();
    }).then(function(json) {
        json = json || {};
        console.log(json);
        if (json && json.success) {
            msg = "❤ ❤ ❤ photo sent successfully! ❤ ❤ ❤";
            console.log(msg);
            iziToast.destroy();
            iziToast.success({
                "title": msg,
                "titleSize": "3em",
                "messageSize": "2em",
                "close": false,
                "drag": false,
                "pauseOnHover": false,
                "position": "topCenter"
            });
        } else {
            msg = json.message;
            console.log(msg);
            iziToast.error({
                "title": "😭 backend error 😭",
                "message": msg,
                "titleSize": "3em",
                "messageSize": "2em",
                "close": false,
                "drag": false,
                "pauseOnHover": false,
                "position": "topCenter"
            });
        }
    }).catch(function(err) {
        console.log(msg);
        iziToast.error({
            "title": "😭 error connecting to the server 😭",
            "message": err,
            "titleSize": "3em",
            "messageSize": "2em",
            "close": false,
            "drag": false,
            "pauseOnHover": false,
            "position": "topCenter"
        });
        cancelPhoto();
    });
}


function cancelPhoto() {
    console.log("cancel photo");
    document.querySelector("#send-photo-btn").classList.add("disabled");
    document.querySelector("#cancel-photo-btn").classList.add("disabled");
    var canvas = document.querySelector("#sb-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    Countdown.stop();
}


function isBlank(canvas) {
    var blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() == blank.toDataURL();
}


function sendPhoto() {
    console.log("send photo");
    Countdown.stop();
    var canvas = document.querySelector("#sb-canvas");
    if (!canvas || isBlank(canvas)) {
        var msg = "I cowardly refuse to send a blank image.";
        console.log(msg);
        iziToast.warning({
            "title": msg,
            "titleSize": "3em",
            "messageSize": "2em",
            "close": false,
            "drag": false,
            "pauseOnHover": false,
            "position": "topCenter"
        });
        return;
    }
    return sendData(canvas.toDataURL("image/jpeg"));
}


function _takePhoto(message) {
    console.log("take photo");
    var video = document.querySelector("#sb-video");
    if (!(video.offsetWidth && video.offsetHeight)) {
        var msg = "missing video";
        console.log(msg);
        iziToast.warning({
            "title": msg,
            "message": "please grant camera permissions",
            "titleSize": "3em",
            "messageSize": "2em",
            "close": false,
            "drag": false,
            "pauseOnHover": false,
            "position": "topCenter"
        });
        return;
    }
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
    iziToast.question({
        "title": "do you like what you see?",
        "message": message || "press \"share photo\" to publish!",
        "titleSize": "3em",
        "messageSize": "2em",
        "close": false,
        "drag": false,
        "pauseOnHover": false,
        "position": "topCenter"
    });
    Countdown.start(5, cancelPhoto);
}


function takePhoto(msg) {
    window.setTimeout(function() { _takePhoto(msg); }, 1000);
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
        iziToast.error({
            "title": "unable to open camera",
            "message": "please reload this page: " + err,
            "titleSize": "3em",
            "messageSize": "2em",
            "close": false,
            "drag": false,
            "pauseOnHover": false,
            "position": "topCenter"
        });
    });
}


function resizeCanvas(el, canvasID) {
    var canvas = document.getElementById(canvasID);
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeighth;
}
