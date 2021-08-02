export default class GameSyncManager {
    constructor() {
        this.positionUpdatesChannel;
        this.gameEventChannel;

    }

    //TODO rename to 'handlePositionUpdates'
    updateRemoteObjects = (data) => {
        //TODO von game.js updateRemoteObjects übernehmen
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

        let msg = {
            message: message,
            item: item
        };
        let json = JSON.stringify(msg);
        console.log(json);

        this.gameEventChannel.send(json);
    }

    // TODO call methods or raise events in proper GameEventManager?
    handleGameEvent = (gameEvent) => {
        if (gameEvent.message === 'gameStart') {
            // gameStart();
        }
        if (gameEvent.message === 'closeExplanationScreen') {
            // document.getElementById('explanationScreen').classList.add('deactivated');
            // hideOverlay();
        }
        if (gameEvent.message === 'gameOver') {
            // showGameOver(false);
        }
        if (gameEvent.message === 'gameModeSelection') {
            // todo cleanUpScene();
            // returnToGameModeSelection();
        }
        if (gameEvent.message === 'remove') {
            console.log("Calling removeFromScene");
            // removeFromScene(gameEvent.item);
            // sceneManager.removeFromScene(event.data.item);
        }
    }
}
