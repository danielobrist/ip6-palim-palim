

export default class DatachannelManager {
    constructor(gameSyncManager) {
        this.peerConnection;
        this.gameSyncManager = gameSyncManager;

        this.positionUpdatesChannel;
        this.gameEventChannel;
    }

    handleDataChannelAdded = (event) => {
        console.log('Received Channel Callback');
        console.dir(event.channel);

        if (event.channel.label === 'positionUpdates') {
            this.initPositionUpdatesChannel(event.channel);
            console.log("Created new Datachannel after channel was added")
            console.log(this.positionUpdatesChannel);
        }

        if (event.channel.label === 'gameEvents') {
            this.initGameEventChannel(event.channel);
            console.log("Created new Datachannel after channel was added")
            console.log(this.gameEventChannel);
        }
    }

    initPositionUpdatesChannel = (dataChannel) => {
        if (!dataChannel) {
            console.log("creating new Datachannel...")
            dataChannel = this.peerConnection.createDataChannel('positionUpdates');
            dataChannel.onerror = this.handleDataChannelError;
            dataChannel.onopen = this.handleDataChannelStatusChange;
            dataChannel.onclose = this.handleDataChannelStatusChange;
        }
        this.positionUpdatesChannel = dataChannel;
        this.positionUpdatesChannel.onmessage = this.handlePositionUpdatesMessage;
        this.positionUpdatesChannel.onerror = this.handleDataChannelError;
        this.positionUpdatesChannel.onopen = this.handleDataChannelStatusChange;
        this.positionUpdatesChannel.onclose = this.handleDataChannelStatusChange;

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

    handlePositionUpdatesMessage = (event) => {
        this.gameSyncManager.handlePositionUpdates(event.data);
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
