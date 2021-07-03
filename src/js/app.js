import "core-js/stable";
import "regenerator-runtime/runtime";
import adapter from 'webrtc-adapter';

import Detector from './utils/detector';
import VideoChat, {isInitiator} from './videoChat/videoChat';
import {prepare, startGame} from './game/game';

// Styles
import './../css/app.scss';

let videoChat;
const roomNameButton = document.getElementById('roomNameButton');

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
    console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
}


async function initWebGL() {
    // Check for webGL capabilities
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    } else {
        const container = document.getElementById('appContainer');
        container.classList.add('deactivated');
        // new GameScene(container);
        await prepare();
    }
}

const initGameLobby = () => {
    if(__ENV__ !== 'dev') {
        roomNameButton.addEventListener('click', () => {
            document.getElementById('welcomeScreen').classList.add('deactivated');

            let roomNumber = document.getElementById('roomName').value;
            initVideoChat(roomNumber);

            let waitingToOtherRoomMates = document.getElementById('waitingToOtherRoomMates');
            waitingToOtherRoomMates.classList.remove('deactivated');

            let roomNumberElement = document.createElement("p");
            roomNumberElement.innerHTML = roomNumber;
            roomNumberElement.classList.add('roomNumber');
            waitingToOtherRoomMates.append(roomNumberElement);

        });
    }
}

const initVideoChat = (roomName) => {
    if(__ENV__ !== 'dev') {
        videoChat = new VideoChat(roomName);
    }
}



initWebGL();
initGameLobby();

if(__ENV__ === 'dev') {
    startGame("1");
}
