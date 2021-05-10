import {changeCameraPosition, getSceneJSON, updateRemoteObjects} from './three.js';

export {sendChannel as dataChannel};

let sendChannel;
let receiveChannel;

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19302'
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

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

/////////////////////////////////////////////

// var room = 'room';
// Could prompt for room name:
var room = prompt('Enter room name:');

var socket = io.connect();

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

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message',room, message); 
}

// This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(message)
    .then(function () {
      return doAnswer();
    })
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}



var constraints = {
    audio: true,
    video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    
    for (const track of localStream.getTracks()) {
      pc.addTrack(track);
    }

    initDataChannel();
    console.log('Created RTCDataChannel');

    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
    startGameSync();
  }
}

window.onpagehide = function() {
  sendMessage('bye');
};

// handle tabs closing(almost all browsers) or pagehide(needed for iPad/iPhone)
var isOnIOS = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2; // must be iOS...
var eventName = isOnIOS ? "pagehide" : "beforeunload";

window.addEventListener(eventName, function (event) { 
    sendMessage('bye');
} );

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    if (location.hostname !== 'localhost') {
      pc = new RTCPeerConnection(pcConfig);
    } else {
      pc = new RTCPeerConnection(null);
    } 

    pc.onicecandidate = handleIceCandidate;
    pc.ontrack = ev => {
      if (ev.streams && ev.streams[0]) {
        console.log("ev streams detected")
        remoteVideo.srcObject = ev.streams[0];
      } else {
        if (!remoteStream) {
          console.log("Creating new MediaStream")
          remoteStream = new MediaStream();
        }
        console.log("adding track to remote stream")
        remoteStream.addTrack(ev.track);
        remoteVideo.setAttribute('src', remoteStream);
        remoteVideo.srcObject = remoteStream;
      }
      remoteVideo.autoplay = true;
      
    }
    pc.ondatachannel = receiveChannelCallback;

    console.log('Created RTCPeerConnnection');

  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function startGameSync() {
  //TODO set interval
  let interval = setInterval(sendGameobjectPositions, 30);
}

function sendGameobjectPositions() {
  //TODO send JSON Strings of gameobject and positions
  if (sendChannel.readyState === "open") {
    sendChannel.send(getSceneJSON());
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
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.streams[0];
  remoteVideo.autoplay = true;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
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
  sendChannel.close();
  receiveChannel.close();
  pc.close();
  pc = null;
  remoteVideo.pause();
  remoteVideo.removeAttribute('src'); // empty source
  remoteVideo.removeAttribute('autoplay');
  remoteVideo.load();
}

/////////////////////////////////////

function initDataChannel() {
console.log('CREATING DATACHANNEL gameUpdates')
sendChannel = pc.createDataChannel('gameUpdates', {
  ordered: false,
  id: room
  });
sendChannel.onmessage = function (event) {
    console.log("Got Data Channel Message:", event.data);
  };
sendChannel.onerror = function (error) {
    console.log("Data Channel Error:", error);
  };
sendChannel.onopen = handleDataChannelStatusChange;
sendChannel.onclose = handleDataChannelStatusChange;

console.log('CREATED DATACHANNEL gameUpdates')
}


function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = handleReceiveMessage;
  receiveChannel.onopen = handleReceiveChannelStatusChange;
  receiveChannel.onclose = handleReceiveChannelStatusChange;
}

function handleReceiveMessage(event) {
  //TODO if gameUpdates channel, update positions and render again
  // console.log("Received Message data: " + event.data);
  updateRemoteObjects(event.data);
}

function handleDataChannelStatusChange(event) {
  if (sendChannel) {
    var state = sendChannel.readyState;

    if (state === "open") {
      console.log("DATA CHANNEL STATE: open")
    } else {
      console.log("DATA CHANNEL STATE: closed")
    }
  }
}

function handleReceiveChannelStatusChange() {
  if (receiveChannel) {
    console.log("Receive channel's status has changed to " +
                receiveChannel.readyState);
  }
}