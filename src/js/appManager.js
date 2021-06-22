import "core-js/stable";
import "regenerator-runtime/runtime";

import Detector from './utils/detector';
import VideoChat, {isInitiator} from './videoChat/videoChat';
import {startGame, startGameMode} from './game/game';
import MenuManager from "./menuManager";

export default class AppManager {
    
    constructor() {
        this.menuManager = new MenuManager();
    }

    start() {
        
        if(isDev()) {
            console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
        }
        
        checkWebGlCapabilities();
        startGame(isInitiator);
        
    
        if(isProd()) {
            this.menuManager.startMenu();        
        } else {
            startGameMode("1");
        }

    }

    // TODO move to VideoChatManager
    initVideoChat(roomName) {
        if(isProd()) {
            let videoChat = new VideoChat(roomName);
            // TODO get isInitiator from VideoCall somehow...
        }
    }
}

function checkWebGlCapabilities() {
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    } else {
        return;
    }
}

function isDev() {
    return __ENV__ === 'dev';
}

function isProd() {
    return !isDev();
}