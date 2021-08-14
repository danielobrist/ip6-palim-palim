import InteractionManager from "./interactionManager";
import ShoppingListManager from "./shoppingListManager";
import GameStateManager from "./gameStateManager";
import AudioManager from "./audioManager";
import Helpers from "../helpers";

export default class GameManager {

    isSeller = false;
    gameLobbyManager;
    gameStateManager;
    sceneManager;
    gameSyncManager;
    audioManager;
    peerConnectionManager;

    constructor(gameLobbyManager, sceneManager, gameSyncManager, peerConnectionManager){
        this.gameLobbyManager = gameLobbyManager;
        this.sceneManager = sceneManager;
        this.gameSyncManager = gameSyncManager;
        this.peerConnectionManager = peerConnectionManager;
        this.shoppingListManager = new ShoppingListManager();


        this.gameLobbyManager.addEventListener('startGame', (event) => this.handleStartGameEvent(event));
        this.gameSyncManager.addEventListener('startGame', (event) => this.handleStartGameEvent(event));

        this.gameLobbyManager.addEventListener('closeExplanationScreen', () => this.handleCloseExplanationScreenEvent());
        this.gameSyncManager.addEventListener('closeExplanationScreen', () => this.handleCloseExplanationScreenEvent());

        this.gameSyncManager.addEventListener( 'basketAdd', (event) => this.handleBasketAddEvent(event));

        this.gameSyncManager.addEventListener('gameOver', () => this.handleGameOverEvent());

        this.gameLobbyManager.addEventListener('restartGame', () => this.handleRestartGame());
        this.gameSyncManager.addEventListener('restartGame', () => this.handleRestartGame());
    }

    handleRestartGame = () => {
        if (!this.isSeller) {
            this.gameLobbyManager.goToGameModeSelection();
        }

        //todo this.sceneManager.cleanUpScene();
    };

    handleCloseExplanationScreenEvent = () => {
        this.audioManager.playPalimSound();
        this.gameLobbyManager.closeExplanationScreen();
    };

    handleStartGameEvent = (event) => {
        console.log("STARTING GAME WITH VIDEOMODE " + event.videoMode + " AND GAMEMODE " + event.gameMode);

        console.log("initiator: " + this.peerConnectionManager.roomManager.isInitiator);
        const seller = !(this.peerConnectionManager.roomManager.isInitiator);
        if(seller) {
            this.isSeller = seller;
            this.sceneManager.isSeller = seller;
        }
        console.log("seller: " + this.isSeller);
        this.startGame(event.gameMode, event.videoMode);
    };

    async prepareGame(){
        await this.sceneManager.prepareScene();
        this.audioManager = new AudioManager(this.sceneManager.localCamera);
    }

    async startGame(gameMode, videoMode) {

        this.gameLobbyManager.hideSettingScreens();
        this.gameLobbyManager.showExplanationScreen(this.isSeller);

        await this.loadConfig(gameMode);
        await this.handOverConfigToSceneManager();
        this.createGameStateManager();

        if(!this.isSeller) {
            this.generateShoppingList();
        }

        await this.sceneManager.placeVideos(videoMode);
        this.sceneManager.placeVirtualCamera(this.isSeller);
        this.initControls();

        this.sceneManager.loadBackground();
        await this.sceneManager.init3DObjects();

        if (Helpers.isDev()) {
            this.sceneManager.initDevThings();
        }

        document.getElementById("appContainer").classList.remove('deactivated');
        this.sceneManager.animate();

    }

    generateShoppingList = () => {
        this.gameStateManager.shoppingListAsMap = this.shoppingListManager.generateShoppingListAsMap(this.config.buyerModelsStart);
        this.shoppingListManager.writeShoppingListToDom(this.gameStateManager.shoppingListAsMap, this.config.models);
    };

    loadConfig = async(gameMode) => {
        let configFile;

        if(gameMode === "2") {
            configFile = await import('../config/sceneConfig2');
        } else {
            configFile = await import('../config/sceneConfig1');
        }

        this.config = configFile.default;
    };

    handOverConfigToSceneManager = () => {
        this.sceneManager.config = this.config;
    };

    createGameStateManager = () => {
        this.gameStateManager = new GameStateManager(this.config, this.sceneManager, this.gameSyncManager);
        this.gameStateManager.addEventListener('gameOver', () => this.handleGameOverEvent());
    };

    handleGameOverEvent = () => {

        this.gameLobbyManager.playConfetti();

        setTimeout(() =>{
            this.gameLobbyManager.showGameOverScreen(this.isSeller);
            this.sceneManager.showVideosAfterGameOver();
        }, 2500);

        this.audioManager.playWinSound();
    };

    initControls = () => {

        this.interactionManager = new InteractionManager(
            this.sceneManager.renderer,
            this.sceneManager.localCamera,
            this.sceneManager.isSeller,
            this.sceneManager.basketMesh,
            this.gameSyncManager
        );

        this.interactionManager.draggableObjects = this.sceneManager.interactionObjects;

        this.interactionManager.addEventListener( 'basketAdd', (itemObjectId) => this.handleBasketAddEvent(itemObjectId));

        if(Helpers.isDev()) {
            this.sceneManager.visualizeTheInteractionPlaneAndItemSink(this.interactionManager);
        }
    };

    handleBasketAddEvent = (event) => {

        const item = this.sceneManager.localScene.getObjectByProperty('objectId', event.objectId);
        console.log(item);

        this.gameStateManager.basket.addItem(item);
        console.log('ADDED ITEM TO BASKET: ' + item.name + ' WITH ID ' + event.objectId);

        if(!this.isSeller) {
            console.log('checkgameover');
            this.gameStateManager.checkGameOver();
            this.shoppingListManager.strikeThroughPurchasedItems(item.typeId);

            this.audioManager.playCompleteTaskSound();
        }
    }
}
