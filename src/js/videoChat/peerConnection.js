export default class PeerConnection {
    constructor() {
        this.peerConnectionConfig = {
            'iceServers': [
                {
                  'urls': 'stun:stun.l.google.com:19302'
                },
                {
                  'urls': 'turn:86.119.43.130:3478',
                  'credential': 'ZV78Nz75/3sk<:d.[.#m3;dch4v(2+RdvS9',
                  'username': 'palimpalim'
                }
            ]
        };

        this.rtcPeerConnection = this.create();
        this.dataChannels = [];

        return this.rtcPeerConnection;
    }

    create = () => {
        try {
            if (location.hostname !== 'localhost') {
                this.rtcPeerConnection = new RTCPeerConnection();
                this.rtcPeerConnection.setConfiguration(this.peerConnectionConfig);
            } else {
                this.rtcPeerConnection = new RTCPeerConnection();
                // this.rtcPeerConnection.setConfiguration(this.peerConnectionConfig);
            }
        
            console.log('Created RTCPeerConnnection: ' + this.rtcPeerConnection);
            console.log('With config: ' + this.rtcPeerConnection.getConfiguration());
            return this.rtcPeerConnection;

          } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            // eslint-disable-next-line no-alert
            alert('Failed to create RTCPeerConnection object.');
        }
    };

    //TODO unused
    createDataChannel(channelName) {
        if (this.rtcPeerConnection) {
            const dataChannel = this.rtcPeerConnection.createDataChannel(channelName, {
                ordered: false,
                // id: room
            });

            this.dataChannels.push(dataChannel);
        }
    }
}
