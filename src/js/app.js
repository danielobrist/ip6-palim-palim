import "core-js/stable";
import "regenerator-runtime/runtime";

import Detector from './utils/detector';
import VideoChat, {isInitiator} from './videoChat/videoChat';
import {start, startGame2} from './game/game';

// Styles
import './../css/app.scss';

let videoChat;
const roomNameButton = document.getElementById('roomNameButton');

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}

//initVideoChat()
initGame();


function initVideoChat(roomName) {
    if(__ENV__ !== 'dev') {
        videoChat = new VideoChat(roomName);
        // TODO get isInitiator from VideoCall somehow...
    }
}



function initGame() {
    // Check for webGL capabilities
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    } else {
        const container = document.getElementById('appContainer');
        // new GameScene(container);
        start(isInitiator);
    }
}

if(__ENV__ !== 'dev') {
    roomNameButton.addEventListener('click', () => {
        initVideoChat(document.getElementById('roomName').value);
    
        document.getElementById('roomNameSection').classList.add = 'deactivated';
    
        let waitingToOtherRoomMates = document.createElement("p");
        waitingToOtherRoomMates.innerHTML = 'Auf andere Raum-Teilnehmer warten...';
    
        document.getElementById('welcomeScreen').append(waitingToOtherRoomMates);
    });
}

if(__ENV__ === 'dev') {
    startGame2("1");
}
