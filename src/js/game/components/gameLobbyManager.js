import * as THREE from 'three';
import party from "party-js";

export default class GameLobbyManager extends THREE.EventDispatcher{
    constructor() {
        super();
        this.roomNumber;

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
                console.log("STARTING GAME");
                this.dispatchEvent( { type: 'startGame', gameMode: gameMode, videoMode: videoMode } );                
            });
        }
    }

    hideSettingScreens = () => {
        this.videoModeScreen.classList.add('deactivated');
        this.settingsScreen.classList.add('deactivated');
    }

    showExplanationscreen = (isInitiator) => {
        if(isInitiator) {
            document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-buyer.jpg')";
        } else {
            document.getElementById('explanationScreen').style.backgroundImage = "url('./assets/explanations/explanation-seller.jpg')";
            document.getElementById('closeExplanationScreen').classList.add('deactivated');
        }
        document.getElementById('explanationScreen').classList.remove('deactivated');
    
        document.getElementById('closeExplanationScreen').addEventListener('click', () => {
            document.getElementById('explanationScreen').classList.add('deactivated');
            this.dispatchEvent( { type: 'closeExplanationScreen' } );
        });
    }

    hideOverlay = () => {
        document.getElementById('overlay').classList.add('whileGameIsRunning');
    }

    showWaitingScreen = () => {
        this.waitingScreen.classList.remove('deactivated');
        this.addRoomnumberElement();
    }

    hideWaitingScreen = () => {
        document.getElementById('waitingToOtherRoomMates').classList.add('deactivated');
    }

    //TODO use this for all show/hides
    hide(screen) {
        screen.classList.add('deactivated');
    }

    addRoomnumberElement = () => {
        let roomNumberElement = document.createElement("p");
        roomNumberElement.innerHTML = this.roomNumber;
        roomNumberElement.classList.add('roomNumber');
        this.waitingScreen.append(roomNumberElement);
    }


    showGameOver = (showRestart) => {
        this.playConfetti();

        setTimeout(function(){
            document.getElementById('overlay').classList.remove('whileGameIsRunning');
            document.getElementById('gameOverScreen').classList.remove('deactivated');
            this.showVideos();
            if (showRestart) {
                document.getElementById('restartGameButton').addEventListener('click', () => {
                    //todo cleanUpScene();
                    this.gameEventManager.sendGoToGameModeSelection();
                    this.returnToGameModeSelection();
                });
            } else {
                document.getElementById('restartGameButton').classList.add('deactivated');
            }
        }, 2500);

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
}
