import * as THREE from 'three';

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

        //register all lobby screens here ?
        this.roomNameButton = document.getElementById('roomNameButton');
        this.roomNameButton.addEventListener('click', () => {
            this.welcomeScreen.classList.add('deactivated');

            this.roomNumber = document.getElementById('roomName').value;

            // if(__ENV__ !== 'dev') {
                console.log(this.roomNumber);
                this.dispatchEvent( { type: 'joinRoom', roomName: this.roomNumber } );
            // }

            this.waitingScreen.classList.remove('deactivated');
            let roomNumberElement = document.createElement("p");
            roomNumberElement.innerHTML = this.roomNumber;
            roomNumberElement.classList.add('roomNumber');
            this.waitingScreen.append(roomNumberElement);

        });
                
        
    }

    goToGameStartScreen() {
        console.log("Going to Game Start Screen");
        this.waitingScreen.classList.add('deactivated');
        this.startGameScreen.classList.remove('deactivated');

        document.getElementById("startGameButton").addEventListener('click', () => {
            this.goToGameModeScreen();
        });    
    }

    goToGameModeScreen() {
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

    goToVideoModeScreen(gameMode) {
        console.log("Going to Video Mode Screen");

        this.gameModeScreen.classList.add('deactivated');
        this.videoModeScreen.classList.remove('deactivated');

        let videoModeButtons = document.getElementsByClassName("button--videoMode");
        for (var i = 0; i < videoModeButtons.length; i++) {

            let videoModeButton = videoModeButtons.item(i);
            let videoMode = videoModeButton.dataset.videomode;

            videoModeButton.addEventListener('click', () => {
                console.log("STARING GAME");
                this.dispatchEvent( { type: 'startGame', gameMode: gameMode, videoMode: videoMode } );                
            });
        }
    }

    hideSettingScreens() {
        this.videoModeScreen.classList.add('deactivated');
        this.settingsScreen.classList.add('deactivated');
    }

    showExplanationscreen(isInitiator) {
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
            this.hideOverlay();
        });
    }

    hideOverlay = () => {
        document.getElementById('overlay').classList.add('whileGameIsRunning');
        //audioManager.playPalimSound();
    }
}