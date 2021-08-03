import GameEventManager from "./gameEventManager";
import ShoppingListManager from "./shoppingListManager";
import GameStateManager from "./gameStateManager";
import AudioManager from "./audioManager";

export default class GameManager {

    isSeller;
    gameLobbyManager;
    gameStateManager;
    sceneManager;
    gameSyncManager;
    audioManager;

    constructor(gameLobbyManager, sceneManager, gameSyncManager){
        this.gameLobbyManager = gameLobbyManager;
        this.sceneManager = sceneManager;
        this.gameSyncManager = gameSyncManager;
        this.shoppingListManager = new ShoppingListManager();

        this.gameLobbyManager.addEventListener('closeExplanationScreen', () => {
            console.log("addEventListener closeExplanationScreen");
            this.audioManager.playPalimSound();
            this.sceneManager.hideOverlay();
        });
    }

    async prepareGame(){
        await this.sceneManager.prepareScene();
        this.audioManager = new AudioManager(this.sceneManager.localCamera);
    }

    async startGame(gameMode, videoMode) {
        this.gameLobbyManager.hideSettingScreens();
        this.gameLobbyManager.showExplanationscreen(this.isSeller);

        //TODO send 'startGame' via gameSync on gameUpdate channel

        await this.loadConfig(gameMode);
        await this.handOverConfigToSceneManager();
        this.createGameStateManager();

        if(this.isSeller) {
            this.generateShoppingList();
        }

        await this.sceneManager.placeVideos(videoMode, this.isSeller);
        this.sceneManager.placeVirtualCamera(this.isSeller);
        this.initControls();

        this.sceneManager.loadBackground();
        await this.sceneManager.init3DObjects();

        if (__ENV__ === 'dev') {
            this.sceneManager.initDevThings();
        }

        document.getElementById("appContainer").classList.remove('deactivated');
        this.sceneManager.animate();

    }

    generateShoppingList = () => {
        this.shoppingListAsMap = this.shoppingListManager.generateShoppingListAsMap(this.config.buyerModelsStart);
        this.gameStateManager.shoppingListAsMap = this.shoppingListAsMap;
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
        this.gameStateManager.addEventListener('gameOver', () => {
            this.gameEventManager.sendGameOver();
            this.gameLobbyManager.showGameOver(!this.isSeller);
            this.sceneManager.audioManager.playWinSound();
        });
    };

    initControls = () => {

        this.gameEventManager = new GameEventManager(
            this.sceneManager.renderer,
            this.sceneManager.localCamera,
            this.sceneManager.isSeller,
            this.sceneManager.basketMesh,
            this.gameSyncManager
        );

        this.gameEventManager.draggableObjects = this.sceneManager.interactionObjects;

        this.gameEventManager.addEventListener( 'basketAdd', function (event) {
            this.gameStateManager.basket.addItem(event.item);
            console.log('ADDED ITEM TO BASKET: ' + event.item.name + ' WITH ID ' + event.item.objectId);
            this.gameStateManager.checkGameOver();

            this.shoppingListManager.strikeThroughPurchasedItems(event.item.typeId);
            this.sceneManager.audioManager.playCompleteTaskSound();
        } );

        this.gameEventManager.addEventListener( 'itemRemove', function (event) {
            // let selectedObjectPlaceholder = event.item.clone();

            // console.log(event.item.startPosition);
            // selectedObjectPlaceholder.position.set(event.item.startPosition);
            // selectedObjectPlaceholder.material.opacity = 0.5;
            // localScene.add(selectedObjectPlaceholder);
        });

        if(__ENV__ === 'dev') {
            this.sceneManager.visualizeTheInteractionPlaneAndItemSink(this.gameEventManager);
        }
    }
}
