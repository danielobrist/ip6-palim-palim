import "core-js/stable";
import "regenerator-runtime/runtime";
import adapter from 'webrtc-adapter';

import Detector from './utils/detector';
import VideoChat from './videoChat/videoChat';
import { prepareScene } from './game/game';

// Styles
import './../css/app.scss';
import GameManager from "./game/components/gameManager";

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}

class AppManager {
    constructor(){
        this.gameManager = new GameManager();
        // this.peerConnectionManager;
        // this.gameLobbyManager
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









if(__ENV__ === 'dev') {
    game.startGame("1");
}
