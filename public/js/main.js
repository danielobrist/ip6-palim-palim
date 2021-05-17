import {changeCameraPosition, getSceneJSON, updateRemoteObjects} from './3d/three.js';

export {dataChannel};

let dataChannel;

let isChannelReady = false;
let isInitiator = false;
let isStarted = false;

let localStream;
let peerConnection;
let remoteStream;

///////////////////////////////////////
/////   socket.io room handling   /////
///////////////////////////////////////

// let room = '123';
let room = prompt('Enter room name:');

const socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or join room', room);
}

socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
  changeCameraPosition();
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

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message',room, message); 
}


/////////////////////////////////////////////
/////   init video capture and stream   /////
/////////////////////////////////////////////

const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})
.then(initLocalStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

function initLocalStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    
    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track);
    }
    
    

    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      initDataChannel();
      console.log('Created RTCDataChannel');
      doCall();
    }

    startGameSync();
  }
}



window.onpagehide = function() {
  hangup();
};

// handle tabs closing(almost all browsers) or pagehide(needed for iPad/iPhone)
var isOnIOS = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2; // must be iOS...
var eventName = isOnIOS ? "pagehide" : "beforeunload";

window.addEventListener(eventName, function (event) { 
    sendMessage('bye');
} );

//////////////////////////////////////////////
/////   create and handle PeerConnection ///// 
//////////////////////////////////////////////

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

function createPeerConnection() {
  try {
    if (location.hostname !== 'localhost') {
      peerConnection = new RTCPeerConnection(pcConfig);
    } else {
      peerConnection = new RTCPeerConnection(null);
    } 

    peerConnection.onicecandidate = handleIceCandidate;
    peerConnection.ontrack = ev => {
      if (ev.streams && ev.streams[0]) {
        console.log("ev streams detected")
        remoteVideo.srcObject = ev.streams[0];
      } else {
        if (!remoteStream) {
          console.log("Creating new MediaStream")
          remoteStream = new MediaStream();
        }
        console.log("Adding track to remote stream")
        remoteStream.addTrack(ev.track);
        remoteVideo.setAttribute('src', remoteStream);
        remoteVideo.srcObject = remoteStream;
      }
      remoteVideo.autoplay = true;
      
    }
    peerConnection.ondatachannel = receiveChannelCallback;

    console.log('Created RTCPeerConnnection');

  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
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

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  peerConnection.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  peerConnection.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  peerConnection.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = true; //when remote leaves, this client will be the new initiator
}

function stop() {
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

/////////////////////////////////////////////
/////   create and handle datachannel   /////
/////////////////////////////////////////////

function initDataChannel() {
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

function receiveChannelCallback(event) {
  console.log('Received Channel Callback');
  dataChannel = event.channel;
  dataChannel.onmessage = handleReceiveMessage;
  dataChannel.onerror = function (error) {
    console.log("Data Channel Error:", error);
  };
  dataChannel.onopen = handleReceiveChannelStatusChange;
  dataChannel.onclose = handleReceiveChannelStatusChange;
  console.log('CREATED DATACHANNEL gameUpdates');
}

function handleReceiveMessage(event) {
  updateRemoteObjects(event.data);
}

function handleDataChannelStatusChange(event) {
  if (dataChannel) {
    var state = dataChannel.readyState;

    if (state === "open") {
      console.log("DATA CHANNEL STATE: open")
    } else {
      console.log("DATA CHANNEL STATE: closed")
    }
  }
}

function handleReceiveChannelStatusChange() {
  if (dataChannel) {
    console.log("Receive channel's status has changed to " +
                dataChannel.readyState);
  }
}

///////////////////////////////////////////////
/////   synchronization of gameobjects    /////
///////////////////////////////////////////////

function startGameSync() {
  let interval = setInterval(sendGameobjectPositions, 30);
}

function sendGameobjectPositions() {
  //TODO send JSON Strings of gameobject and positions
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(getSceneJSON());
  }
}