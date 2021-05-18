import {VideoController} from './videoController.js';
import {changeCameraPosition, getSceneJSON, updateRemoteObjects} from '../3d/three.js';

export {PeerController};

const PeerController = () => {
    const videoController = VideoController();
    let peerConnection;
    let dataChannel;

    let isStarted = false;

    /////////////////////////////////////////////

    const socket = io.connect();

    let isChannelReady = false;
    let isInitiator = false;
    let room = getRoomName();

    if (room !== '') {
        socket.emit('create or join', room);
        console.log('Attempted to create or join room', room);
    }

    socket.on('created', function(room) {
        console.log('Created room ' + room);
        isInitiator = true;
        // changeCameraPosition();
    });

    socket.on('full', function(room) {
        //TODO show user that room is full.
        console.log('Room ' + room + ' is full');
    });
      
    socket.on('join', function (room){
        console.log('Another peer made a request to join room ' + room);
        console.log('This peer is the initiator of room ' + room + '!');
        isChannelReady = true;
    });
      
    socket.on('joined', function(room) {
        console.log('joined: ' + room);
        isChannelReady = true;
    });
      
    socket.on('log', function(array) {
        console.log.apply(console, array);
    });
      
    socket.on('message', function(message) {
        console.log('Client received message:', message);
        if (message === 'got user media') {
            maybeStart();
        } else if (message.type === 'offer') {
            if (!isInitiator && !isStarted) {
                maybeStart();
            }
            peerConnection.setRemoteDescription(message)
            .then(function () {
                return doAnswer();
            })
        } else if (message.type === 'answer' && isStarted) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
                var candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            peerConnection.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }
    });
    
    const getRoomName = () => {
        room = prompt('Enter room name:');
    }
      
    function sendMessage(message) {
        console.log('Client sending message: ', message);
        socket.emit('message',room, message); 
    }


    /////////////////////////////////////
    const pcConfig = {
        'iceServers': [
          {
            'urls': 'stun:stun.l.google.com:19302'
          },
          {
            'urls': 'turn:numb.viagenie.ca',
            'credential': 'muazkh',
            'username': 'webrtc@live.com'
          },
          {
            'urls': 'turn:192.158.29.39:3478?transport=udp',
            'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            'username': '28224511:1379330808'
          },
          {
            'urls': 'turn:192.158.29.39:3478?transport=tcp',
            'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            'username': '28224511:1379330808'
          }
        ]
    };

    const createPeerConnection = () => {
        try {
            if (location.hostname !== 'localhost') {
                peerConnection = new RTCPeerConnection(pcConfig);
            } else {
                peerConnection = new RTCPeerConnection(null);
            } 
        
            peerConnection.onicecandidate = handleIceCandidate;
            peerConnection.ontrack = handleTrackAdded;
            peerConnection.ondatachannel = handleDataChannelAdded;
        
            console.log('Created RTCPeerConnnection');
        
          } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
        }
    }

    

    const handleIceCandidate = (event) => {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    const handleTrackAdded = (event) => {
        if (event.streams && event.streams[0]) {
            console.log("event streams detected")
            remoteVideo.srcObject = event.streams[0];
        } else {
            if (!remoteStream) {
                console.log("Creating new MediaStream")
            remoteStream = new MediaStream();
            }
            console.log("adding track to remote stream")
            remoteStream.addTrack(event.track);
            remoteVideo.setAttribute('src', remoteStream);
            remoteVideo.srcObject = remoteStream;
        }
        remoteVideo.autoplay = true;
    }

    const initDataChannel = () => {
        console.log('CREATING DATACHANNEL gameUpdates')
        dataChannel = peerConnection.createDataChannel('gameUpdates', {
            ordered: false,
            id: room
        });
        dataChannel.onmessage = handleReceiveMessage;
        dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };
        dataChannel.onopen = handleDataChannelStatusChange;
        dataChannel.onclose = handleDataChannelStatusChange;
        
        console.log('CREATED DATACHANNEL gameUpdates')
    }

    const handleDataChannelAdded = (event) => {
        console.log('Received Channel Callback');
        dataChannel = event.channel;
        dataChannel.onmessage = handleReceiveMessage;
        dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };
        dataChannel.onopen = handleDataChannelStatusChange;
        dataChannel.onclose = handleDataChannelStatusChange;
        console.log('CREATED DATACHANNEL gameUpdates');
    }

    const handleReceiveMessage = (event) => {
        updateRemoteObjects(event.data);
    }

    const handleDataChannelStatusChange = () => {
        if (dataChannel) {
            let state = dataChannel.readyState;
      
            if (state === "open") {
                console.log("DATA CHANNEL STATE: open")
            } else {
                console.log("DATA CHANNEL STATE: closed")
            }
        }
    }

    const doCall = () => {
        console.log('Sending offer to peer');
        peerConnection.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    const doAnswer = () => {
        console.log('Sending answer to peer.');
        peerConnection.createAnswer().then(
          setLocalAndSendMessage,
          onCreateSessionDescriptionError
        );
    }

    const handleCreateOfferError = (event) => {
        console.log('createOffer() error: ', event);
    }

    const setLocalAndSendMessage = (sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        roomController.sendMessage(sessionDescription);
    }
      
    const onCreateSessionDescriptionError = (error) => {
        console.log('Failed to create session description: ' + error.toString());
    }
      
    const hangup = () => {
        console.log('Hanging up.');
        stop();
        roomController.sendMessage('bye');
    }
      
    const handleRemoteHangup = () => {
        console.log('Session terminated.');
        stop();
        roomController.isInitiator = true; //when remote leaves, this client will be the new initiator
    }

    const stop = () => {
        isStarted = false;
        dataChannel.close();
        peerConnection.close();
        peerConnection = null;
        remoteVideo.pause();
        remoteVideo.removeAttribute('src'); // empty source
        remoteVideo.removeAttribute('autoplay');
        remoteStream = null;
        remoteVideo.load();
    }

    ///////////////////////////////////////////////
    /////   synchronization of gameobjects    /////
    ///////////////////////////////////////////////

    const startGameSync = () => {
        let interval = setInterval(sendGameobjectPositions, 30);
    }
  
    const sendGameobjectPositions = () => {
        //TODO send JSON Strings of gameobject and positions
        if (dataChannel && dataChannel.readyState === "open") {
            dataChannel.send(getSceneJSON());
        }
    }
    //TODO put this stuff in gameConroller.js or something


    
    return {
        createPeerConnection,
        maybeStart,
        doCall,
        doAnswer,
        hangup,
        handleRemoteHangup,
        initDataChannel,
        getRoomName,
        sendMessage,
        isInitiator,
        isChannelReady,
        dataChannel,
        isStarted
    }
}

