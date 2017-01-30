// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
"use strict";
// In the renderer process.
const electron = require('electron');
const desktopCapturer = electron.desktopCapturer;

const fs = require('fs');
//eval(fs.readFileSync('./RecordRTC.js','utf-8'));

let gWinNum = 0;
let localStream = null;
const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
desktopCapturer.getSources({
    types: ['window', 'screen']
}, (error, sources) => {
    if (error) throw error;
    for (var i = 0; i < sources.length; ++i) {
        console.log("sources[i].name = " + sources[i].name);
        addImage(sources[i].thumbnail);
        if (sources[i].name == "Entire screen") {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sources[i].id,
                        minWidth: width,
                        maxWidth: 2000,
                        minHeight: height,
                        maxHeight: 2048
                    }
                }
            }, gotStream, getUserMediaError);
            //return;
        }
    }
});

function addImage(image) {
    const elm = document.createElement("img");
    elm.src = image.toDataURL();
    document.body.appendChild(elm);
}

function gotStream(stream) {
    localStream = stream;
    window.recordRTC = window.RecordRTC(localStream, {
        type: "video",
        video: {
            width: width,
            height: height
        },
        canvas: {
            width: width,
            height: height
        }
    });
    const video = document.querySelector('video');
    video.src = URL.createObjectURL(stream);
    video.play();
}

function getUserMediaError(e) {
    console.log('getUserMediaError');
}

function toBuffer(ab) {
    const buf = new Buffer(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

const recStartBtn = document.getElementById("recStartBtn");
recStartBtn.addEventListener('click', () => {
    console.log("rec start!");

    window.recordRTC.startRecording();
}, false);
const recStopBtn = document.getElementById("recStopBtn");
recStopBtn.addEventListener('click', () => {
    console.log("rec start!");
    window.recordRTC.stopRecording(() => {
        const blob = window.recordRTC.getBlob();
        console.log(blob);
        const video = document.querySelector('video');
        video.src = URL.createObjectURL(blob);
        video.play();
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            const buf = reader.result;
            console.log(buf);
            fs.writeFileSync("test.webm", toBuffer(buf),{encoding: null});
            console.log("file has been written!")
            //video.src = URL.createObjectURL(buf);
        });
        reader.readAsArrayBuffer(blob);

    });



}, false);