import {  placeVideos, switchView, prepareScene, startGame } from "../game";


export default class GameManager {
    constructor(gameLobbyManager){
        this.gameLobbyManager = gameLobbyManager;
    }

    async prepareScene(){
        prepareScene();
    }

    async startgame(gameMode, videoMode) {
        this.gameLobbyManager.hideSettingScreens();

        //TODO send 'startGame' via gameSync on gameUpdate channel
        startGame(gameMode);

        // this.gameLobbyManager.showExplanationScreen();
        // this.gameLobbyManager.addEventListener('closeExplanationScreen', () => {
        //   //send 'closeExplanationScreen' to remote 
        // })
        // placeVideos(videoMode, isInitiator);
        // switchView(isInitiator);
    }
}