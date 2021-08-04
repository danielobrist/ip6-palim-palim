import * as THREE from 'three';

export default class GameSyncManager extends THREE.EventDispatcher {

    constructor(sceneManager) {
        super();

        this.sceneManager = sceneManager;
        this.positionUpdatesChannel;
        this.gameEventChannel;

    }

    //TODO rename to 'handlePositionUpdates'
    handlePositionUpdates = (data) => {
        this.sceneManager.updateRemoteObjects(data);
    }

    sendGameobjectUpdate = (obj) => {
        if (this.positionUpdatesChannel && typeof obj !== 'undefined' && this.positionUpdatesChannel.readyState === "open") {
            this.positionUpdatesChannel.send(this.getObjJSON(obj));
        }
    }

    getObjJSON = (object) => {
        let obj = {name: object.name, position: object.position, rotation: object.rotation, typeId: object.typeId, objectId: object.objectId};
        let json = JSON.stringify(obj);
        return json;
    }

    sendGameEventMessage = (message, item) => {
        console.log("SENDING GAME EVENT MESSAGE:");

        //todo rename message to eventType and item to eventData

        let msg = {
            message: message,
            item: item
        };
        let json = JSON.stringify(msg);
        console.log(json);

        this.gameEventChannel.send(json);
    }

    handleGameEvent = (gameEvent) => {
        if (gameEvent.message === 'startGame') {
            this.dispatchEvent( { type: 'startGame', gameMode: gameEvent.item.gameMode, videoMode: gameEvent.item.videoMode } );
        }
        if (gameEvent.message === 'closeExplanationScreen') {
            this.dispatchEvent( { type: 'closeExplanationScreen' } );
        }
        if (gameEvent.message === 'gameOver') {
            this.dispatchEvent( { type: 'gameOver' } );
        }
        if (gameEvent.message === 'restartGame') {
            this.dispatchEvent( { type: 'restartGame' } );
        }
        if (gameEvent.message === 'basketAdd') {
            this.dispatchEvent( { type: 'basketAdd', objectId: gameEvent.item.objectId } );
        }
    }
}
