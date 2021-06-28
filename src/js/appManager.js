import "core-js/stable";
import "regenerator-runtime/runtime";

import Detector from './utils/detector';
import VideoChat, {isInitiator} from './videoChat/videoChat';
import GameManager from './game/game';
import MenuManager from "./menuManager";
import SceneManager from "./game/sceneManager";
import GameStateManager from "./game/gameStateManager";

export default class AppManager {
    
    constructor() {
        this.menuManager = new MenuManager();
        const sceneManager = new SceneManager();
        const gameStateManager = new GameStateManager(sceneManager);
        this.gameManager = new GameManager(gameStateManager, sceneManager);
    }

    start() {
        
        if(isDev()) {
            console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
        }
        
        checkWebGlCapabilities();
        //this.gameManager.initGame(isInitiator);
        
    
        if(isProd()) {
            this.menuManager.startMenu();        
        } else {
            this.gameManager.initGame(true);
            this.gameManager.startGameMode("1");
        }

    }

    gameModeStart(gameMode) {
        this.menuManager.removeMenu();
        this.gameManager.startGameMode(gameMode);
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
