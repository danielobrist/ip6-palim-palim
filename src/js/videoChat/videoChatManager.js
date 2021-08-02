import * as THREE from 'three';

export default class VideoChatManager extends THREE.EventDispatcher {
    constructor() {
        super();
        this.isStreamStarted;
        this.localVideo = document.querySelector('#localVideo');
        this.remoteVideo = document.querySelector('#remoteVideo');

        this.localStream;
        this.remoteStream;

    }

    async askForUserMedia() {
        console.log("askForUserMedia");
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        .then(this.initLocalStream)
        .catch(function(e) {
            console.log(e);
            alert('getUserMedia() error: ' + e.name);
        });
    }

    initLocalStream = (stream) => {
        console.log('Adding local stream.');
        console.log(this);
        console.log(stream);

        this.localStream = stream;
        this.localVideo.srcObject = stream;

        this.dispatchEvent({ type: 'gotUserMedia' });
    }
}