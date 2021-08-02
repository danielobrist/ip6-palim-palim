import VideoChat, { initVideoChat, isInitiator } from "../../videoChat/videoChat";
import { placeVideos, switchView, startGame } from "../game";
import { GameSync } from "./gameSync";


// const gameSync = GameSync();

const welcomeScreen = document.getElementById('welcomeScreen');
const waitingScreen = document.getElementById('waitingToOtherRoomMates');
const startGameScreen = document.getElementById("startGameScreen");
const gameModeScreen = document.getElementById('gameModeScreen');
const videoModeScreen = document.getElementById('videoModeScreen');
const settingsScreen = document.getElementById('settingScreens');

const roomNameButton = document.getElementById('roomNameButton');
// roomNameButton.addEventListener('click', () => {
//     welcomeScreen.classList.add('deactivated');

//     let roomNumber = document.getElementById('roomName').value;

//     if(__ENV__ !== 'dev') {
//         new VideoChat(roomNumber);
//     }

//     waitingScreen.classList.remove('deactivated');
//     let roomNumberElement = document.createElement("p");
//     roomNumberElement.innerHTML = roomNumber;
//     roomNumberElement.classList.add('roomNumber');
//     waitingScreen.append(roomNumberElement);

// });

export const goToGameStartScreen = () => {
    console.log("Going to Game Start Screen");
    waitingScreen.classList.add('deactivated');
    startGameScreen.classList.remove('deactivated');

    document.getElementById("startGameButton").addEventListener('click', () => {
        goToGameModeScreen();
    });    
}

const goToGameModeScreen = () => {
    console.log("Going to Game Mode Screen");

    startGameScreen.classList.add('deactivated');
    gameModeScreen.classList.remove('deactivated');

    let gameModeButtons = document.getElementsByClassName("button--gameMode");
    for (var i = 0; i < gameModeButtons.length; i++) {

        let gameModeButton = gameModeButtons.item(i);
        let gameMode = gameModeButton.dataset.gamemode;

        gameModeButton.addEventListener('click', () => {
            goToVideoModeScreen(gameMode);
        });
    }
}

const goToVideoModeScreen = (gameMode) => {
    console.log("Going to Video Mode Screen");

    gameModeScreen.classList.add('deactivated');
    videoModeScreen.classList.remove('deactivated');

    let videoModeButtons = document.getElementsByClassName("button--videoMode");
    for (var i = 0; i < videoModeButtons.length; i++) {

        let videoModeButton = videoModeButtons.item(i);
        let videoMode = videoModeButton.dataset.videomode;

        videoModeButton.addEventListener('click', () => {
            console.log("STARTING GAME");

            // send game Start Event to remote
            // gameSync.sendGameEventMessage('gameStart', null);
            // trigger the same locally
            gameStart(gameMode, videoMode);

            // socket.emit('gameStart', room, gameMode, videoMode);
        });
    }
}

export const gameStart = (gameMode, videoMode) => {
    // hideOverlay();
    hideSettingScreens();
    showExplanationScreen();
    placeVideos(videoMode, isInitiator);
    switchView(isInitiator);
    startGame(gameMode);
}

const hideSettingScreens = () => {
    videoModeScreen.classList.add('deactivated');
    settingsScreen.classList.add('deactivated');
}

const showExplanationScreen = () => {
    if(isInitiator) {
        document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-buyer.jpg')";
    } else {
        document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-seller.jpg')";
        document.getElementById('closeExplanationScreen').classList.add('deactivated');
    }
    document.getElementById('explanationScreen').classList.remove('deactivated');

    document.getElementById('closeExplanationScreen').addEventListener('click', () => {
        // socket.emit('closeExplanationScreen', room);
        // gameSync.sendGameEventMessage('closeExplanationScreen', null);
        // trigger the same locally
        document.getElementById('explanationScreen').classList.add('deactivated');
        hideOverlay();
    });
}

export const hideOverlay = () => {
    document.getElementById('overlay').classList.add('whileGameIsRunning');
    //audioManager.playPalimSound();
}