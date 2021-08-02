import "core-js/stable";
import "regenerator-runtime/runtime";
import adapter from 'webrtc-adapter';

import Detector from './utils/detector';

// Styles
import './../css/app.scss';
import GameManager from "./game/components/gameManager";
import GameSyncManager from "./game/components/gameSyncManager";
import PeerConnectionManager from "./videoChat/peerConnectionManager";
import GameLobbyManager from "./game/components/gameLobbyManager";
import SceneManager from "./game/components/sceneManager";

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}

class AppManager {
    constructor(){
        this.gameSyncManager = new GameSyncManager();
        this.gameLobbyManager = new GameLobbyManager();
        this.peerConnectionManager = new PeerConnectionManager(this.gameLobbyManager, this.gameSyncManager);
        this.gameManager = new GameManager(this.gameLobbyManager);

        this.gameLobbyManager.addEventListener('joinRoom', (event) => {
            // this.peerConnectionManager.joinRGameStateManageroom(event.roomName);

            const isInitiator = true;
            this.gameManager.isSeller = !isInitiator;
            this.sceneManager.isSeller = !isInitiator;

            this.gameManager.startGame(1,1);
            document.getElementById('overlay').classList.add('deactivated');
        });

        this.gameLobbyManager.addEventListener('startGame', (event) => {
            console.log("eventListener startGame");
            this.gameManager.startGame(event.gameMode, event.videoMode);
        });

        this.sceneManager = new SceneManager();
        this.gameManager = new GameManager(this.gameLobbyManager, this.sceneManager, this.gameSyncManager);
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
}

const appManager = new AppManager()
appManager.initApp();
