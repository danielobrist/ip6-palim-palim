import * as THREE from 'three';

export default class GameSyncManager extends THREE.EventDispatcher {

    positionUpdatesChannel;
    gameEventChannel;

    constructor(sceneManager) {
        super();

        this.sceneManager = sceneManager;
    }

    handlePositionUpdates = (data) => {
        this.sceneManager.updateRemoteObjects(data);
    };

    sendGameObjectUpdate = (obj) => {
        if (this.positionUpdatesChannel && typeof obj !== 'undefined' && this.positionUpdatesChannel.readyState === "open") {
            this.positionUpdatesChannel.send(this.getObjJSON(obj));
        }
    };

    getObjJSON = (object) => {
        const obj = {name: object.name, position: object.position, rotation: object.rotation, typeId: object.typeId, objectId: object.objectId};
        return JSON.stringify(obj);
    };

    sendGameEventMessage = (message, item) => {
        console.log("SENDING GAME EVENT MESSAGE:");

        //todo rename message to eventType and item to eventData

        const msg = {
            message: message,
            item: item
        };
        const json = JSON.stringify(msg);
        console.log(json);

        this.gameEventChannel.send(json);
    };

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
