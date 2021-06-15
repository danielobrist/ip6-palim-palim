import "core-js/stable";
import "regenerator-runtime/runtime";

import Config from './data/config';
import Detector from './utils/detector';
import GameScene from './app/gameScene';
import VideoCall, {isInitiator} from './webrtc/videoCall';
import {start} from './app/game';

// Styles
import './../css/app.scss';

let videoCall;
// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');

    Config.isDev = true;
}

//initVideoChat()
initGame();


function initVideoChat(roomName) {
    if(__ENV__ !== 'dev') {
        videoCall = new VideoCall(roomName);
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


const welcomeScreen = document.getElementById('welcomeScreen');
const roomNameSection = document.getElementById('roomNameSection');
const roomName = document.getElementById('roomName');
const roomNameButton = document.getElementById('roomNameButton');

roomNameButton.addEventListener('click', () => {
    initVideoChat(roomName.value);

    roomNameSection.style.display = 'none';

    let waitingToOtherRoomMates = document.createElement("p");
    waitingToOtherRoomMates.innerHTML = 'Auf andere Raum-Teilnehmer warten...';
    welcomeScreen.append(waitingToOtherRoomMates);
});