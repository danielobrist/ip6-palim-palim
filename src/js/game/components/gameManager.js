

export default class GameManager {
    constructor(gameLobbyManager){
        this.gameLobbyManager = gameLobbyManager;
    }

    async prepareScene(){
        
    }

    async startGame(gameMode, videoMode) {
        this.gameLobbyManager.hideSettingScreens();

        //TODO send 'startGame' via gameSync on gameUpdate channel
        

        // this.gameLobbyManager.showExplanationScreen();
        // this.gameLobbyManager.addEventListener('closeExplanationScreen', () => {
        //   //send 'closeExplanationScreen' to remote 
        // })
        // placeVideos(videoMode, isInitiator);
        // switchView(isInitiator);
    }
}