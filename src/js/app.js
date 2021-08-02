import "core-js/stable";
import "regenerator-runtime/runtime";
import adapter from 'webrtc-adapter';

import Detector from './utils/detector';

// Styles
import './../css/app.scss';
import GameManager from "./game/components/gameManager";
import PeerConnectionManager from "./videoChat/peerConnectionManager";
import GameLobbyManager from "./game/components/gameLobbyManager";

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}

class AppManager {
    constructor(){
        this.peerConnectionManager = new PeerConnectionManager();
        this.gameLobbyManager = new GameLobbyManager();
        this.gameManager = new GameManager(this.gameLobbyManager);

        this.gameLobbyManager.addEventListener('joinRoom', (event) => {
            this.peerConnectionManager.joinRoom(event.roomName);
        });

        this.gameLobbyManager.addEventListener('startGame', (event) => {
            this.gameManager.startGame(event.gameMode, event.videoMode);
        })
    }

    async initGame() {
        if(this.checkWebGLCapabilities) {
            await this.gameManager.prepareScene();
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

async function initGame() {
    // Check for webGL capabilities
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    } else {
        const container = document.getElementById('appContainer');
        container.classList.add('deactivated');

        
        //await prepareScene();
    }
}

const appManager = new AppManager()
appManager.initGame();


// if(__ENV__ === 'dev') {
//     game.startGame("1");
// }
