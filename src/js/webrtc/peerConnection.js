export default class PeerConnection {
    constructor() {
        this.peerConnectionConfig = {
            'iceServers': [
                {
                  'urls': 'stun:stun.l.google.com:19302'
                },
                {
                  'urls': 'turn:86.119.43.130:3478',
                  'credential': 'ZV78Nz75/3sk<:d.[.#m\3;dch4v(2+RdvS9',
                  'username': 'palimpalim'
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