

export default class DatachannelManager {
    constructor(gameSyncManager) {
        this.peerConnection;
        this.gameSyncManager = gameSyncManager;

        //TODO maybe store channels in a Map to dynamically create more
        this.positionUpdatesChannel;
        this.gameEventChannel;
    }


    initGameUpdatesChannel = (dataChannel) => {
        if (!dataChannel) {
            console.log("creating new Datachannel...")
            dataChannel = this.peerConnection.createDataChannel('gameUpdates');
            dataChannel.onerror = this.handleDataChannelError;
            dataChannel.onopen = this.handleDataChannelStatusChange;
            dataChannel.onclose = this.handleDataChannelStatusChange;
        }
        this.positionUpdatesChannel = dataChannel;
        this.positionUpdatesChannel.onmessage = this.handleGameUpdatesMessage;
        this.positionUpdatesChannel.onerror = dataChannel.onerror;
        this.positionUpdatesChannel.onopen = dataChannel.onopen;
        this.positionUpdatesChannel.onclose = dataChannel.onclose;

        this.gameSyncManager.positionUpdatesChannel = this.positionUpdatesChannel;
    }

    initGameEventChannel = (dataChannel) => {
        if (!dataChannel) {
            console.log("creating new Datachannel...")
            dataChannel = this.peerConnection.createDataChannel('gameEvents');
            dataChannel.onerror = this.handleDataChannelError;
            dataChannel.onopen = this.handleDataChannelStatusChange;
            dataChannel.onclose = this.handleDataChannelStatusChange;
        }
        this.gameEventChannel = dataChannel;
        this.gameEventChannel.onmessage = this.handleGameEvents;
        this.gameEventChannel.onerror = dataChannel.onerror;
        this.gameEventChannel.onopen = dataChannel.onopen;
        this.gameEventChannel.onclose = dataChannel.onclose; 
    
        this.gameSyncManager.gameEventChannel = this.gameEventChannel;
    }

    handleGameUpdatesMessage = (event) => {
        this.gameSyncManager.updateRemoteObjects(event.data);
    }

    handleGameEvents = (event) => {
        console.log("RECEIVED GAME EVENT MESSAGE");
        console.log(event.data);
        let gameEvent = JSON.parse(event.data);
        this.gameSyncManager.handleGameEvent(gameEvent);
    }

    handleDataChannelError = (error) => {
        console.log("Data Channel Error:", error);
    }

    handleDataChannelStatusChange = () => {
        if (this.positionUpdatesChannel) {
            let state = this.positionUpdatesChannel.readyState; 

            if (state === "open") {
                console.log("DATA CHANNEL STATE: open")
            } else {
                console.log("DATA CHANNEL STATE: closed")
            }
        }

        if (this.gameEventChannel) {
            let state2 = this.gameEventChannel.readyState; 

            if (state2 === "open") {
                console.log("DATA CHANNEL2 STATE: open")
            } else {
                console.log("DATA CHANNEL2 STATE: closed")
            }
        }
    }

    closeChannels = () => {
        this.gameEventChannel.close();
        this.positionUpdatesChannel.close();
    }
}