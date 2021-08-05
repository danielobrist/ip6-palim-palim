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

    startLocalVideo = async () => {
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
    
    handleTrackAdded = (event) => {
        if (event.streams && event.streams[0]) {
            console.log("event streams detected")
            this.remoteVideo.srcObject = event.streams[0];
        } else {
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }
            console.log("adding track to remote stream")
            this.remoteStream.addTrack(event.track);
            this.remoteVideo.setAttribute('src', this.remoteStream);
            this.remoteVideo.srcObject = this.remoteStream;
        }
        this.remoteVideo.autoplay = true;
    }
}