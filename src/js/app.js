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
        let roomNumber = document.getElementById('roomName').value;
        initVideoChat(roomNumber);

        let waitingToOtherRoomMates = document.createElement("p");
        waitingToOtherRoomMates.innerHTML = 'Teile deinem Enkelkind eure Raumnummer mit und warte, bis dieses in euren Raum kommt.';
        waitingToOtherRoomMates.classList.add('waitingToOtherRoomMates');

        let roomNumberElement = document.createElement("p");
        roomNumberElement.innerHTML = roomNumber;
        roomNumberElement.classList.add('roomNumber');

        let welcomeScreen = document.querySelector('#welcomeScreen > div');
        welcomeScreen.innerHTML = '';
        welcomeScreen.append(waitingToOtherRoomMates);
        welcomeScreen.append(roomNumberElement);
    });
}

if(__ENV__ === 'dev') {
    startGame2("1");
}
