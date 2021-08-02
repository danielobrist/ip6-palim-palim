import { hideSettingScreens, showExplanationScreen} from "./gameLobby"
import GameEventManager from "./gameEventManager";
import {strikeThroughPurchasedItemsFromShoppingList, writeShoppingList} from "./shoppingList";
import GameStateManager from "./gameStateManager";
import {isInitiator} from "../../videoChat/videoChat";


export default class GameManager {

    isSeller;

    constructor(gameLobbyManager, sceneManager){
        this.gameLobbyManager = gameLobbyManager;
        this.sceneManager = sceneManager;
    }

    async prepareGame(){
        this.sceneManager.prepareScene();
    }

    async startGame(gameMode, videoMode) {

        hideSettingScreens();
        showExplanationScreen();

        console.log("startGameInGameManager");

        this.gameLobbyManager.hideSettingScreens();
        //this.sceneManager.loadBackground();

        //TODO send 'startGame' via gameSync on gameUpdate channel

        // this.gameLobbyManager.showExplanationScreen();
        // this.gameLobbyManager.addEventListener('closeExplanationScreen', () => {
        //   //send 'closeExplanationScreen' to remote
        // })
        // placeVideos(videoMode, isInitiator);
        // switchView(isInitiator);

        await this.loadConfig(gameMode);

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

    async loadConfig(gameMode) {
        let configFile;

        if(gameMode === "2") {
            configFile = await import('../config/sceneConfig2');
        } else {
            configFile = await import('../config/sceneConfig1');
        }

        this.config = configFile.default;
        this.sceneManager.config = this.config;
        this.gameStateManager = new GameStateManager(this.config);
        this.gameStateManager.addEventListener('gameOver', (event) => {
            this.gameEventManager.sendGameOver();
            this.gameLobbyManager.showGameOver(true);  //TODO refactor this, true should be !isSeller
            this.sceneManager.audioManager.playWinSound();
        });

        if(isInitiator) {
            writeShoppingList(gameStateManager.shoppingList, config.models);
        }
    }

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

            this.gameStateManager.addItemToListOfItemsInBasket(event.item);
            this.gameStateManager.addItemToVisualBasket(event.item);
            console.log('ADDED ITEM TO BASKET: ' + event.item.name + ' WITH ID ' + event.item.objectId);
            this.gameStateManager.checkGameOver();

            strikeThroughPurchasedItemsFromShoppingList(event.item.typeId);
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
