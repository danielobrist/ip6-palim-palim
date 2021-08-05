import * as THREE from 'three';
import party from "party-js";

export default class GameLobbyManager extends THREE.EventDispatcher{

    roomNumber;

    constructor(gameSyncManager) {
        super();

        this.gameSyncManager = gameSyncManager;

        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.waitingScreen = document.getElementById('waitingToOtherRoomMates');
        this.startGameScreen = document.getElementById("startGameScreen");
        this.gameModeScreen = document.getElementById('gameModeScreen');
        this.videoModeScreen = document.getElementById('videoModeScreen');
        this.settingsScreen = document.getElementById('settingScreens');
        this.explanationScreen = document.getElementById('explanationScreen');
        this.overlay = document.getElementById('overlay');
        this.gameOverScreen = document.getElementById('gameOverScreen');

        this.roomNameButton = document.getElementById('roomNameButton');
        this.roomNameButton.addEventListener('click', () => {
            this.roomNumber = document.getElementById('roomName').value;

            if (this.roomNumber && this.roomNumber !== '') {
                this.welcomeScreen.classList.add('deactivated');
                this.dispatchEvent( { type: 'joinRoom', roomName: this.roomNumber } );
                this.showWaitingScreen();
            }
        });

        this.startGameButton = document.getElementById("startGameButton");
        this.startGameButton.addEventListener('click', () => {
            this.goToGameModeScreen();
        });

        this.closExplanationButton = document.getElementById('closeExplanationScreen');
        this.closExplanationButton.addEventListener('click', () => {
            this.dispatchEvent( { type: 'closeExplanationScreen' } );
            this.gameSyncManager.sendGameEventMessage("closeExplanationScreen");
        });

        this.restartGameButton = document.getElementById('restartGameButton');
        this.restartGameButton.addEventListener('click', () => {
            this.gameSyncManager.sendGameEventMessage('restartGame');
            this.dispatchEvent({ type: 'restartGame' });
        });
    }

    goToGameStartScreen = () => {
        console.log("Going to Game Start Screen");
        this.waitingScreen.classList.add('deactivated');
        this.startGameScreen.classList.remove('deactivated');
    };

    goToGameModeScreen = () => {
        console.log("Going to Game Mode Screen");

        this.startGameScreen.classList.add('deactivated');
        this.gameModeScreen.classList.remove('deactivated');

        const gameModeButtons = document.getElementsByClassName("button--gameMode");
        for (let i = 0; i < gameModeButtons.length; i++) {

            const gameModeButton = gameModeButtons.item(i);
            const gameMode = gameModeButton.dataset.gamemode;

            gameModeButton.addEventListener('click', () => {
                this.goToVideoModeScreen(gameMode);
            });
        }
    };

    goToVideoModeScreen = (gameMode) => {
        console.log("Going to Video Mode Screen");

        this.gameModeScreen.classList.add('deactivated');
        this.videoModeScreen.classList.remove('deactivated');

        const videoModeButtons = document.getElementsByClassName("button--videoMode");
        for (let i = 0; i < videoModeButtons.length; i++) {

            const videoModeButton = videoModeButtons.item(i);
            const videoMode = videoModeButton.dataset.videomode;

            videoModeButton.addEventListener('click', () => {
                this.dispatchEvent( { type: 'startGame', gameMode: gameMode, videoMode: videoMode } );
                this.gameSyncManager.sendGameEventMessage("startGame", {gameMode: gameMode, videoMode: videoMode});
            });
        }
    };

    hideSettingScreens = () => {
        this.videoModeScreen.classList.add('deactivated');
        this.settingsScreen.classList.add('deactivated');
    };

    showExplanationScreen = (isSeller) => {
        if(isSeller) {
            this.explanationScreen.style.backgroundImage = "url('./assets/explanations/explanation-seller.jpg')";
            this.closExplanationButton.classList.add('deactivated');
        } else {
            this.explanationScreen.style.backgroundImage = "url('./assets/explanations/explanation-buyer.jpg')";
        }
        this.explanationScreen.classList.remove('deactivated');
    };

    closeExplanationScreen = () => {
        this.explanationScreen.classList.add('deactivated');
        this.overlay.classList.add('whileGameIsRunning');
    };

    hideOverlay = () => {
        this.overlay.classList.add('whileGameIsRunning');
    };

    showWaitingScreen = () => {
        this.waitingScreen.classList.remove('deactivated');
        this.addRoomNumberElement();
    };

    hideWaitingScreen = () => {
        this.waitingScreen.classList.add('deactivated');
    };

    addRoomNumberElement = () => {
        const roomNumberElement = document.createElement("p");
        roomNumberElement.innerHTML = this.roomNumber;
        roomNumberElement.classList.add('roomNumber');
        this.waitingScreen.append(roomNumberElement);
    };

    showGameOverScreen = (isSeller) => {
        this.overlay.classList.remove('whileGameIsRunning');
        this.gameOverScreen.classList.remove('deactivated');
        this.settingsScreen.classList.remove('deactivated');

        if (isSeller) {
            this.restartGameButton.classList.add('deactivated');
        }
    };

    playConfetti = () => {
        const element = document.getElementById("appContainer");
        party.confetti(element,{
            count: party.variation.range(200, 400),
            debug: false,
            gravity: 800,
            zIndex: 99999,
        });
    };

    goToGameModeSelection = () => {
        this.gameOverScreen.classList.add('deactivated');
        this.gameModeScreen.classList.remove('deactivated');
    };
}
