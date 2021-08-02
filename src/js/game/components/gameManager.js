import { hideSettingScreens, showExplanationScreen} from "./gameLobby"
import GameEventManager from "./gameEventManager";
import ShoppingListManager from "./shoppingListManager";
import GameStateManager from "./gameStateManager";
import {isInitiator} from "../../videoChat/videoChat";


export default class GameManager {

    isSeller;
    gameLobbyManager;
    gameStateManager;
    sceneManager;
    gameSyncManager;

    constructor(gameLobbyManager, sceneManager, gameSyncManager){
        this.gameLobbyManager = gameLobbyManager;
        this.sceneManager = sceneManager;
        this.gameSyncManager = gameSyncManager;
        this.shoppingListManager = new ShoppingListManager();
    }

    async prepareGame(){
        this.sceneManager.prepareScene();
    }

    async startGame(gameMode, videoMode) {
        this.gameLobbyManager.hideSettingScreens();
        this.gameLobbyManager.showExplanationscreen(this.isSeller);

        //TODO send 'startGame' via gameSync on gameUpdate channel

        // this.gameLobbyManager.addEventListener('closeExplanationScreen', () => {
        //   //send 'closeExplanationScreen' to remote
        // })
        // placeVideos(videoMode, isInitiator);
        // switchView(isInitiator);

        await this.loadConfig(gameMode);
        await this.handOverConfigToSceneManager();

        this.createGameStateManager();

        if(this.isSeller) {
            this.shoppingListAsMap = this.shoppingListManager.generateShoppingListAsMap(this.config.buyerModelsStart);
            this.gameStateManager.shoppingListAsMap = this.shoppingListAsMap;

            this.shoppingListManager.writeShoppingListToDom(this.gameStateManager.shoppingListAsMap, this.config.models);
        }


        this.sceneManager.placeVideos(videoMode, this.isSeller);
        this.sceneManager.switchViewUsingIsSeller(this.isSeller);
        this.initControls();


        this.sceneManager.loadBackground();
        await this.sceneManager.init3DObjects();
        // if (__ENV__ === 'dev') {
        //     initControls(isSeller);
        //     initDevThings();
        // }
        document.getElementById("appContainer").classList.remove('deactivated');
        this.sceneManager.animate();

    }

    loadConfig = async(gameMode) => {
        let configFile;

        if(gameMode === "2") {
            configFile = await import('../config/sceneConfig2');
        } else {
            configFile = await import('../config/sceneConfig1');
        }

        this.config = configFile.default;
    }

    handOverConfigToSceneManager = () => {
        this.sceneManager.config = this.config;
    }

    createGameStateManager = () => {
        this.gameStateManager = new GameStateManager(this.config, this.sceneManager, this.gameSyncManager);
        this.gameStateManager.addEventListener('gameOver', (event) => {
            this.gameEventManager.sendGameOver();
            this.gameLobbyManager.showGameOver(true);  //TODO refactor this, true should be !isSeller
            this.sceneManager.audioManager.playWinSound();
        });
    };

    initControls = () => {

        this.gameEventManager = new GameEventManager(
            this.sceneManager.renderer,
            this.sceneManager.localCamera,
            this.sceneManager.isSeller,
            this.sceneManager.basketMesh
        );

        // TODO this should be in gameLoopManager
        // gameEventManager.setDraggableObjects(interactionObjects);
        this.gameEventManager.draggableObjects = this.sceneManager.interactionObjects;
        console.log(this.gameEventManager.draggableObjects);
        // console.log(JSON.stringify(gameEventManager.draggableObjects));
        this.gameEventManager.addEventListener( 'basketAdd', function (event) {

            //localScene.remove(event.item);

            // TODO update state

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
