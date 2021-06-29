import PeerConnection from "./peerConnection";
import {updateRemoteObjects, switchView, placeVideos} from '../game/game';
import {writeShoppingList} from '../game/components/shoppingList';
import {startGame, showGameOver, cleanUpScene} from '../game/game.js';
import DataChannel from "./dataChannel";

export let dataChannel;
export let dataChannel2;
export let isInitiator;

export default class VideoChat{
    constructor(roomName) {
        isInitiator = false;
        let isChannelReady = false;
        let isStarted = false;

        let localStream;
        let remoteStream;

        let peerConnection;
        // let dataChannel;

        ///////////////////////////////////////
        /////   socket.io room handling   /////
        ///////////////////////////////////////

        // let room = '123';
        //let roomName = prompt('Enter room name:');

        const socket = io.connect();

        if (roomName !== '') {
            
            socket.emit('create or join', roomName);
            console.log('Attempted to create or join room', roomName);
        }

        socket.on('created', function(room) {
            console.log('Created room ' + room);
            isInitiator = true;
            
            writeShoppingList(isInitiator);
        });

        socket.on('full', function(room) {
            //TODO show user that room is full.
            console.log('Room ' + room + ' is full');
        });

        socket.on('join', function (room){
            console.log('Another peer made a request to join room ' + room);
            console.log('This peer is the initiator of room ' + room + '!');
            isChannelReady = true;

            document.getElementById('waitingToOtherRoomMates').classList.add('deactivated');
            document.getElementById("startGameScreen").classList.remove('deactivated');

            document.getElementById("startGameButton").addEventListener('click', () => {
                goToGameModeScreen(room);
                //socket.emit('gameStart', room);
            });    
        });

        function goToGameModeScreen(room) {
            document.getElementById('startGameScreen').classList.add('deactivated');
            document.getElementById('gameModeScreen').classList.remove('deactivated');

            let gameModeButtons = document.getElementsByClassName("button--gameMode");
            for (var i = 0; i < gameModeButtons.length; i++) {

                let gameModeButton = gameModeButtons.item(i);
                let gameMode = gameModeButton.dataset.gamemode;

                gameModeButton.addEventListener('click', () => {
                    goToVideoModeScreen(room, gameMode);
                });
            }

        }
        
        function goToVideoModeScreen(room, gameMode) {
            document.getElementById('gameModeScreen').classList.add('deactivated');
            document.getElementById('videoModeScreen').classList.remove('deactivated');

            let videoModeButtons = document.getElementsByClassName("button--videoMode");
            for (var i = 0; i < videoModeButtons.length; i++) {

                let videoModeButton = videoModeButtons.item(i);
                let videoMode = videoModeButton.dataset.videomode;

                videoModeButton.addEventListener('click', () => {
                    socket.emit('gameStart', room, gameMode, videoMode);
                });
            }
        }

        socket.on('gameStart',  function(gameMode, videoMode) {
            gameStart(gameMode, videoMode);
        });

        function gameStart(gameMode, videoMode) {
            hideOverlay();
            placeVideos(videoMode, isInitiator);
            switchView(isInitiator);
            startGame(gameMode);
        }

        function hideOverlay() {
            document.getElementById('overlay').classList.add('whileGameIsRunning');
            document.getElementById('videoModeScreen').classList.add('deactivated');
        }

        socket.on('joined', function(room) {
            console.log('joined: ' + room);
            isChannelReady = true;
            document.getElementById('waitingToOtherRoomMates').classList.add('deactivated');
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
                    }
                );
                peerConnection.addIceCandidate(candidate);
            } else if (message === 'bye' && isStarted) {
                handleRemoteHangup();
            }
        });

        function sendSignalingMessage(message) {
            console.log('Client sending message: ', message);
            socket.emit('message', roomName, message); 
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
            sendSignalingMessage('got user media');
            if (isInitiator) {
                maybeStart();
            }
        }

        const maybeStart = () => {
            console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
            if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
                console.log('>>>>>> creating peer connection');
                initPeerConnection();
                
                for (const track of localStream.getTracks()) {
                    peerConnection.addTrack(track);
                }

                isStarted = true;
                console.log('isInitiator', isInitiator);
                if (isInitiator) {
                    initDataChannel('gameUpdates', handleReceiveMessage);
                    initDataChannel2('gameEvents', handleGameEventMessage);
                    console.log('Created RTCDataChannel');
                    doCall();
                }

                // gameController.startSharedSceneSync();
            }
        }



        window.onpagehide = function() {
            hangup();
        };

        // handle tabs closing(almost all browsers) or pagehide(needed for iPad/iPhone)
        var isOnIOS = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2; // must be iOS...
        var eventName = isOnIOS ? "pagehide" : "beforeunload";

        window.addEventListener(eventName, function (event) { 
            sendSignalingMessage('bye');
        });

        //////////////////////////////////////////////
        /////   create and handle PeerConnection ///// 
        //////////////////////////////////////////////

        const initPeerConnection = () => {
            peerConnection = new PeerConnection();
            peerConnection.onicecandidate = handleIceCandidate;
            peerConnection.ontrack = handleTrackAdded;
            peerConnection.ondatachannel = handleDataChannelAdded;
        }

        function handleIceCandidate(event) {
            console.log('icecandidate event: ', event);
            if (event.candidate) {
                sendSignalingMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            } else {
                console.log('End of candidates.');
            }
        }

        function handleTrackAdded(event) {
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

        function handleCreateOfferError(event) {
            console.log('createOffer() error: ', event);
        }

        function doCall() {
            console.log('Sending offer to peer');
            peerConnection.createOffer().then(setLocalAndSendMessage).catch(handleCreateOfferError);
        }

        function doAnswer() {
            console.log('Sending answer to peer.');
            peerConnection.createAnswer().then(
                setLocalAndSendMessage,
                onCreateSessionDescriptionError
            );
        }

        const setLocalAndSendMessage = (sessionDescription) => {
            console.log('setLocalAndSendMessage set local description: ', sessionDescription, peerConnection);
            peerConnection.setLocalDescription(sessionDescription);
            console.log('setLocalAndSendMessage sending message', sessionDescription);
            sendSignalingMessage(sessionDescription);
        }

        function onCreateSessionDescriptionError(error) {
            console.log('Failed to create session description: ' + error.toString());
        }

        function hangup() {
            console.log('Hanging up.');
            stop();
            sendSignalingMessage('bye');
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
            //   gameController.stopSharedSceneSync();
        }

        /////////////////////////////////////////////
        /////   create and handle datachannel   /////
        /////////////////////////////////////////////

        function initDataChannel(channelName, messageReceivedCallback) {
            console.log('CREATING DATACHANNEL ' + channelName);
            dataChannel = peerConnection.createDataChannel(channelName);
            dataChannel.onmessage = messageReceivedCallback;
            dataChannel.onerror = handleDataChannelError;
            dataChannel.onopen = handleDataChannelStatusChange;
            dataChannel.onclose = handleDataChannelStatusChange;
            console.log('CREATED DATACHANNEL ' + channelName);
        }

        function initDataChannel2(channelName, messageReceivedCallback) {
            console.log('CREATING DATACHANNEL ' + channelName);
            dataChannel2 = peerConnection.createDataChannel(channelName);
            dataChannel2.onmessage = messageReceivedCallback;
            dataChannel2.onerror = handleDataChannelError;
            dataChannel2.onopen = handleDataChannelStatusChange;
            dataChannel2.onclose = handleDataChannelStatusChange;
            console.log('CREATED DATACHANNEL ' + channelName);
        }


        function handleDataChannelAdded(event) {
            console.log('Received Channel Callback');
            console.log(event.channel);

            if (event.channel.label === 'gameUpdates') {
                // new DataChannel(event.channel);

                // dataChannel = event.channel;
                // dataChannel.onmessage = event.channel.onmessage;
                // dataChannel.onerror = event.channel.onerror;
                // dataChannel.onopen = event.channel.onopen;
                // dataChannel.onclose = event.channel.onclose;

                dataChannel = event.channel;
                dataChannel.onmessage = handleReceiveMessage;
                dataChannel.onerror = event.channel.onerror;
                dataChannel.onopen = event.channel.onopen;
                dataChannel.onclose = event.channel.onclose;
            }

            if (event.channel.label === 'gameEvents') {
                // new DataChannel(event.channel);
                dataChannel2 = event.channel;
                dataChannel2.onmessage = handleGameEventMessage;
                dataChannel2.onerror = event.channel.onerror;
                dataChannel2.onopen = event.channel.onopen;
                dataChannel2.onclose = event.channel.onclose;
            }

        }

        function handleReceiveMessage(event) {
            updateRemoteObjects(event.data);
        }

        function handleGameEventMessage(event) {
            if (event.data === 'gameOver') {
                showGameOver(false);
            }
            if (event.data === 'gameModeSelection') {
                cleanUpScene();
                //TODO Return to gameMode selection (buyer)
            }
        }

        function handleDataChannelError(error) {
            console.log("Data Channel Error:", error);
        };

        function handleDataChannelStatusChange(event) {
            if (dataChannel) {
                var state = dataChannel.readyState; 

                if (state === "open") {
                    console.log("DATA CHANNEL STATE: open")
                } else {
                    console.log("DATA CHANNEL STATE: closed")
                }
            }

            if (dataChannel2) {
                var state2 = dataChannel2.readyState; 

                if (state2 === "open") {
                    console.log("DATA CHANNEL2 STATE: open")
                } else {
                    console.log("DATA CHANNEL2 STATE: closed")
                }
            }
        }
    }
}
