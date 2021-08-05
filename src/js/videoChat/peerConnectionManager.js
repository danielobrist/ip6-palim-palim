import DatachannelManager from "./datachannelManager";
import PeerConnection from "./peerConnection";
import RoomManager from "./roomManager";
import VideoChatManager from "./videoChatManager";


export default class PeerConnectionManager {

    peerConnection;

    constructor(gameLobbyManager, gameSyncManager) {
        this.gameLobbyManager = gameLobbyManager;
        this.gameSyncManager = gameSyncManager;

        this.roomManager = new RoomManager();
        this.videoChatManager = new VideoChatManager();
        this.datachannelManager = new DatachannelManager(gameSyncManager);

        this.gameLobbyManager.addEventListener('joinRoom', (event) => {
            this.joinRoom(event.roomName);
        });

        this.roomManager.addEventListener('peerJoined', () => {
            this.gameLobbyManager.goToGameStartScreen();
        });

        this.videoChatManager.addEventListener('gotUserMedia', () => {
            this.roomManager.sendSignalingMessage('got user media');
            
            if (this.roomManager.isInitiator) {
                this.maybeStart();
            }
        });

        this.roomManager.addEventListener('serverMessage', (event) => {
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
                const candidate = new RTCIceCandidate({
                        sdpMLineIndex: event.message.label,
                        candidate: event.message.candidate
                    }
                );
                this.peerConnection.addIceCandidate(candidate);
            } else if (event.message === 'bye' && this.videoChatManager.isStreamStarted) {
                this.handleRemoteHangup();
            }
        })
    }

    joinRoom = (roomName) => {
        console.log("JOINING ROOM " + roomName);
        this.roomManager.joinRoom(roomName);
        this.videoChatManager.startLocalVideo();
    };

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
                this.datachannelManager.initPositionUpdatesChannel();
                this.datachannelManager.initGameEventChannel();
                console.log('Created RTCDataChannels');
                this.doCall();
            }
        }
    };

    initPeerConnection = () => {
        this.peerConnection = new PeerConnection();
        this.peerConnection.onicecandidate = this.handleIceCandidate;
        this.peerConnection.ontrack = this.videoChatManager.handleTrackAdded;
        this.peerConnection.ondatachannel = this.datachannelManager.handleDataChannelAdded;
        this.datachannelManager.peerConnection = this.peerConnection;
    };

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
    };

    doCall = () => {
        console.log('Sending offer to peer');
        this.peerConnection.createOffer().then(this.setLocalAndSendMessage).catch(this.handleCreateOfferError);
    };

    doAnswer = () =>  {
        console.log('Sending answer to peer.');
        this.peerConnection.createAnswer().then(
            this.setLocalAndSendMessage,
            this.onCreateSessionDescriptionError
        );
    };

    handleCreateOfferError = (event) => {
        console.log('createOffer() error: ', event);
    };

    setLocalAndSendMessage = (sessionDescription) => {
        this.peerConnection.setLocalDescription(sessionDescription);
        this.roomManager.sendSignalingMessage(sessionDescription);
    };

    onCreateSessionDescriptionError = (error) => {
        console.log('Failed to create session description: ' + error.toString());
    };

    hangUp = () => {
        console.log('Leaving the call.');
        this.stop();
        this.roomManager.sendSignalingMessage('bye');
    };

    handleRemoteHangup = () => {
        console.log('Peer left the call.');
        this.stop();
        this.roomManager.isInitiator = true;
    };

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
