import DatachannelManager from "./datachannelManager";
import PeerConnection from "./peerConnection";
import RoomManager from "./roomManager";
import VideoChatManager from "./videoChatManager";


export default class PeerConnectionManager {
    constructor(gameLobbyManager, gameSyncManager) {
        this.gameLobbyManager = gameLobbyManager;
        this.roomManager = new RoomManager();
        this.videoChatManager = new VideoChatManager();
        this.datachannelManager = new DatachannelManager(gameSyncManager);

        this.peerConnection;

        this.roomManager.addEventListener('peerJoined', () => {
            this.gameLobbyManager.goToGameStartScreen();
        });

        this.videoChatManager.addEventListener('gotUserMedia', () => {
            console.log('gotUserMedia event');
            this.roomManager.sendSignalingMessage('got user media');
            
            console.log(this.roomManager.isInitiator);

            if (this.roomManager.isInitiator) {
                this.maybeStart();
            }
        });

        this.roomManager.addEventListener('serverMessage', (event) => {
            console.log("servermessage Event");
            console.log(event.message);

            if (event.message === 'got user media') {
                this.maybeStart();
            } else if (event.message.type === 'offer') {
                if (!this.roomManager.isInitiator && !this.videoChatManager.isStreamStarted) {
                    this.maybeStart();
                }
                this.peerConnection.setRemoteDescription(event.message)
                    .then(() => {
                        return this.doAnswer();
                })
            } else if (event.message.type === 'answer' && this.videoChatManager.isStreamStarted) {
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(event.message));
            } else if (event.message.type === 'candidate' && this.videoChatManager.isStreamStarted) {
                let candidate = new RTCIceCandidate({
                        sdpMLineIndex: event.message.label,
                        candidate: event.message.candidate
                    }
                );
                this.peerConnection.addIceCandidate(candidate);
            } else if (event.message === 'bye' && this.videoChatManager.isStreamStarted) {
                this.handleRemoteHangup();
            }
        })

        this.handlePageClosing(); //TODO move this to AppManager and clean up game too?
    }

    handlePageClosing = () => {
        // handle tabs closing (almost all browsers) or pagehide (needed for iPad/iPhone)
        let isOnIOS = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2; // probably iOS...
        let eventName = isOnIOS ? "pagehide" : "beforeunload";
        window.addEventListener(eventName, (event) => { 
            this.hangUp();
        });
    }

    joinRoom = (roomName) => {
        console.log("JOINING ROOM " + roomName);
        this.roomManager.joinRoom(roomName);
        this.videoChatManager.askForUserMedia();
    }

    maybeStart = () => {
        console.log('>>>>>>> maybeStart() ', 
            this.videoChatManager.isStreamStarted, 
            this.videoChatManager.localStream, 
            this.roomManager.isRoomReady
        );
        if (!this.videoChatManager.isStreamStarted && typeof this.videoChatManager.localStream !== 'undefined' && this.roomManager.isRoomReady) {
            console.log('>>>>>> creating peer connection');
            this.initPeerConnection();
                
            for (const track of this.videoChatManager.localStream.getTracks()) {
                this.peerConnection.addTrack(track);
            }
            this.videoChatManager.isStreamStarted = true;

            console.log('isInitiator', this.roomManager.isInitiator);
            if (this.roomManager.isInitiator) {
                this.datachannelManager.initGameUpdatesChannel();
                this.datachannelManager.initGameEventChannel();
                console.log('Created RTCDataChannel');
                console.log(this.datachannelManager.positionUpdatesChannel);
                console.log(this.datachannelManager.gameEventChannel);
                this.doCall();
            }
        }
    }

    initPeerConnection = () => {
        this.peerConnection = new PeerConnection();
        this.peerConnection.onicecandidate = this.handleIceCandidate;
        this.peerConnection.ontrack = this.handleTrackAdded;
        this.peerConnection.ondatachannel = this.handleDataChannelAdded;
        this.datachannelManager.peerConnection = this.peerConnection;
    }

    handleIceCandidate = (event) => {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            this.roomManager.sendSignalingMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    handleTrackAdded = (event) => {
        console.log("handleTrackAdded");
        
        if (event.streams && event.streams[0]) {
            console.log("event streams detected")
            this.videoChatManager.remoteVideo.srcObject = event.streams[0];
        } else {
            //TODO maybe move this part to a method in VideoChatManager?
            if (!this.videoChatManager.remoteStream) {
                console.log("Creating new MediaStream")
                this.videoChatManager.remoteStream = new MediaStream();
            }
            console.log("adding track to remote stream")
            this.videoChatManager.remoteStream.addTrack(event.track);
            this.videoChatManager.remoteVideo.setAttribute('src', this.videoChatManager.remoteStream);
            this.videoChatManager.remoteVideo.srcObject = this.videoChatManager.remoteStream;
        }
        this.videoChatManager.remoteVideo.autoplay = true;
    }

    handleDataChannelAdded = (event) => {
        console.log('Received Channel Callback');
        console.log(event.channel);

        if (event.channel.label === 'gameUpdates') {
            this.datachannelManager.initGameUpdatesChannel(event.channel);
            console.log("Created new Datachannel after channel was added")
            console.log(this.datachannelManager.positionUpdatesChannel);
        }

        if (event.channel.label === 'gameEvents') {
            this.datachannelManager.initGameEventChannel(event.channel);
            console.log("Created new Datachannel after channel was added")
            console.log(this.datachannelManager.gameEventChannel);
        }
    }

    doCall = () => {
        console.log('Sending offer to peer');
        this.peerConnection.createOffer().then(this.setLocalAndSendMessage).catch(this.handleCreateOfferError);
    }

    doAnswer = () =>  {
        console.log('Sending answer to peer.');
        this.peerConnection.createAnswer().then(
            this.setLocalAndSendMessage,
            this.onCreateSessionDescriptionError
        );
    }

    handleCreateOfferError = (event) => {
        console.log('createOffer() error: ', event);
    }

    setLocalAndSendMessage = (sessionDescription) => {
        this.peerConnection.setLocalDescription(sessionDescription);
        this.roomManager.sendSignalingMessage(sessionDescription);
    };

    onCreateSessionDescriptionError = (error) => {
        console.log('Failed to create session description: ' + error.toString());
    }

    hangUp = () => {
        console.log('Hanging up.');
        this.stop();
        this.roomManager.sendSignalingMessage('bye');
    }

    handleRemoteHangup = () => {
        console.log('Session terminated.');
        this.stop();
        this.roomManager.isInitiator = true;
    }

    stop = () => {
        this.videoChatManager.isStreamStarted = false;
        this.datachannelManager.closeChannels();
        this.peerConnection.close();
        this.peerConnection = null;
        this.videoChatManager.remoteVideo.pause();
        this.videoChatManager.remoteVideo.removeAttribute('src');
        this.videoChatManager.remoteVideo.removeAttribute('autoplay');
        this.videoChatManager.remoteStream = null;
        this.videoChatManager.remoteVideo.load();
    }
}