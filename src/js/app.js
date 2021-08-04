import "core-js/stable";
import "regenerator-runtime/runtime";
import adapter from 'webrtc-adapter';
import Detector from './utils/detector';
import GameManager from "./game/components/gameManager";
import GameSyncManager from "./game/components/gameSyncManager";
import PeerConnectionManager from "./videoChat/peerConnectionManager";
import GameLobbyManager from "./game/components/gameLobbyManager";
import SceneManager from "./game/components/sceneManager";

// Style
import './../css/app.scss';

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}

class AppManager {
    constructor(){
        this.sceneManager = new SceneManager();
        this.gameSyncManager = new GameSyncManager(this.sceneManager);
        this.gameLobbyManager = new GameLobbyManager(this.gameSyncManager);
        this.peerConnectionManager = new PeerConnectionManager(this.gameLobbyManager, this.gameSyncManager);
        this.gameManager = new GameManager(this.gameLobbyManager, this.sceneManager, this.gameSyncManager, this.peerConnectionManager);

        this.gameLobbyManager.addEventListener('joinRoom', (event) => {
            this.peerConnectionManager.joinRoom(event.roomName);
        });

        this.handlePageClosing();
    }

    async initApp() {
        if(this.checkWebGLCapabilities) {
            await this.gameManager.prepareGame();
        }
    }

    checkWebGLCapabilities() {
        if(!Detector.webgl) {
            Detector.addGetWebGLMessage();
            return false;
        } else {
            return true;
        }
    }

    handlePageClosing = () => {
        // handle tabs closing (almost all browsers) or pagehide (needed for iPad/iPhone)
        let isOnIOS = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2; // probably iOS...
        let eventName = isOnIOS ? "pagehide" : "beforeunload";
        window.addEventListener(eventName, () => { 
            this.peerConnectionManager.hangUp();
        });
    }
}

const appManager = new AppManager()
appManager.initApp();
