import * as THREE from 'three';
import Basket from "./basket";

export default class GameStateManager extends THREE.EventDispatcher {

    shoppingListAsMap;

    constructor(config, sceneManager, gameSyncManager){
        super();

        this.basket = new Basket();
        this.sceneManager = sceneManager;
        this.gameSyncManager = gameSyncManager;
        this.gameOverCheck = config.gameOverCheck;
    }

    checkGameOver() {
        const isGameOver = this.gameOverCheck(this.shoppingListAsMap, this.basket.items);
        if (isGameOver) {
            alert('GAME OVER');
            this.dispatchEvent( { type: 'gameOver' } );
        }
    }
}
