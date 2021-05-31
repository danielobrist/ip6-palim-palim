export default class PeerConnection {
    constructor() {
        this.peerConnectionConfig = {
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

        this.rtcPeerConnection = this.create();
        this.dataChannels = [];

        return this.rtcPeerConnection;
    }

    create() {
        try {
            if (location.hostname !== 'localhost') {
                this.rtcPeerConnection = new RTCPeerConnection(this.peerConnectionConfig);
            } else {
                this.rtcPeerConnection = new RTCPeerConnection(this.peerConnectionConfig);
            }
        
            console.log('Created RTCPeerConnnection: ' + this.rtcPeerConnection);
            return this.rtcPeerConnection;

          } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
        }
    }

    createDataChannel(channelName) {
        if (this.rtcPeerConnection) {
            let dataChannel = this.rtcPeerConnection.createDataChannel(channelName, {
                ordered: false,
                id: room
            });

            
            this.dataChannels.push(dataChannel);
        }
    }
}