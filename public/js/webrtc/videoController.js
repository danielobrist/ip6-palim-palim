import {PeerController} from './peerController.js';

export{VideoController};

const VideoController = () => {
    const peerController = PeerController();

    const localVideo = document.querySelector('#localVideo');
    const remoteVideo = document.querySelector('#remoteVideo');

    let localStream;


    const getMediaStream = () => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
          .then(initLocalStream)
          .catch(function(e) {
            alert('getUserMedia() error: ' + e.name);
          });
    }
    
      
    function initLocalStream(stream) {
        console.log('Adding local stream.');
        localStream = stream;
        localVideo.srcObject = stream;
        peerController.sendMessage('got user media');
        if (peerController.isInitiator) {
            peerController.maybeStart();
        }
    }

    return {
        getMediaStream,
        localStream    
    }
}