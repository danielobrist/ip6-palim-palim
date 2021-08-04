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

        this.roomNameButton = document.getElementById('roomNameButton');
        this.roomNameButton.addEventListener('click', () => {
            this.welcomeScreen.classList.add('deactivated');

            this.roomNumber = document.getElementById('roomName').value;

            this.dispatchEvent( { type: 'joinRoom', roomName: this.roomNumber } );

            this.showWaitingScreen();
        });
                
        
    }

    goToGameStartScreen = () => {
        console.log("Going to Game Start Screen");
        this.waitingScreen.classList.add('deactivated');
        this.startGameScreen.classList.remove('deactivated');

        document.getElementById("startGameButton").addEventListener('click', () => {
            this.goToGameModeScreen();
        });    
    }

    goToGameModeScreen = () => {
        console.log("Going to Game Mode Screen");

        this.startGameScreen.classList.add('deactivated');
        this.gameModeScreen.classList.remove('deactivated');

        let gameModeButtons = document.getElementsByClassName("button--gameMode");
        for (var i = 0; i < gameModeButtons.length; i++) {

            let gameModeButton = gameModeButtons.item(i);
            let gameMode = gameModeButton.dataset.gamemode;

            gameModeButton.addEventListener('click', () => {
                this.goToVideoModeScreen(gameMode);
            });
        }
    }

    goToVideoModeScreen = (gameMode) => {
        console.log("Going to Video Mode Screen");

        this.gameModeScreen.classList.add('deactivated');
        this.videoModeScreen.classList.remove('deactivated');

        let videoModeButtons = document.getElementsByClassName("button--videoMode");
        for (var i = 0; i < videoModeButtons.length; i++) {

            let videoModeButton = videoModeButtons.item(i);
            let videoMode = videoModeButton.dataset.videomode;

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
            document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-seller.jpg')";
            document.getElementById('closeExplanationScreen').classList.add('deactivated');
        } else {
            document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-buyer.jpg')";
        }
        document.getElementById('explanationScreen').classList.remove('deactivated');
    
        document.getElementById('closeExplanationScreen').addEventListener('click', () => {
            this.dispatchEvent( { type: 'closeExplanationScreen' } );
            this.gameSyncManager.sendGameEventMessage("closeExplanationScreen");

        });
    };

    closeExplanationScreen = () => {
        document.getElementById('explanationScreen').classList.add('deactivated');
        document.getElementById('overlay').classList.add('whileGameIsRunning');
    };

    hideOverlay = () => {
        document.getElementById('overlay').classList.add('whileGameIsRunning');
    };

    showWaitingScreen = () => {
        this.waitingScreen.classList.remove('deactivated');
        this.addRoomNumberElement();
    };

    hideWaitingScreen = () => {
        document.getElementById('waitingToOtherRoomMates').classList.add('deactivated');
    };

    //TODO use this for all show/hides
    hide(screen) {
        screen.classList.add('deactivated');
    }

    addRoomNumberElement = () => {
        let roomNumberElement = document.createElement("p");
        roomNumberElement.innerHTML = this.roomNumber;
        roomNumberElement.classList.add('roomNumber');
        this.waitingScreen.append(roomNumberElement);
    };


    showGameOverScreen = (isSeller) => {
        document.getElementById('overlay').classList.remove('whileGameIsRunning');
        document.getElementById('gameOverScreen').classList.remove('deactivated');
        document.getElementById('settingScreens').classList.remove('deactivated');

        if (isSeller) {
            document.getElementById('restartGameButton').classList.add('deactivated');
        } else {
            document.getElementById('restartGameButton').addEventListener('click', () => {
                //todo cleanUpScene();
                this.gameSyncManager.sendGameEventMessage('restartGame');
                this.dispatchEvent({ type: 'restartGame' });
            });
        }
    };

    playConfetti = () => {
        const element = document.getElementById("appContainer")
        party.confetti(element,{
            count: party.variation.range(200, 400),
            /**
             * Whether the debugging mode should be enabled.
             */
            debug: false,
            /**
             * The amount of gravity to apply to particles in the scene, in pixels.
             * Note that this value is positive by default, since the y-axis increases
             * downwards in a DOM.
             */
            gravity: 800,
            /**
             * The z-index to place the DOM containers at.
             */
            zIndex: 99999,
        });
    };

    goToGameModeSelection = () => {
        document.getElementById('gameOverScreen').classList.add('deactivated');
        document.getElementById('gameModeScreen').classList.remove('deactivated');
    };
}
