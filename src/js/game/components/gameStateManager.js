import * as THREE from 'three';
import GameState from "./gameState";

export default class GameStateManager extends THREE.EventDispatcher {

    shoppingListAsMap;

    constructor(config, sceneManager, gameSyncManager){
        super();

        this.gameState = new GameState();
        this.sceneManager = sceneManager;
        this.gameSyncManager = gameSyncManager;
        this.gameOverCheck = config.gameOverCheck;
    }

    addItemToListOfItemsInBasket(item) {
        if (this.gameState.basketItems.get(item.typeId)) {
            this.gameState.basketItems.set(item.typeId, this.gameState.basketItems.get(item.typeId) + 1);
        } else {
            this.gameState.basketItems.set(item.typeId, 1);
        }
    }

    addItemToVisualBasket(item) {
        const freePosition = this.getFreePositionInBasket();

        if(freePosition) {
            item.scale.set(0.75, 0.75, 0.75);
            item.position.set(freePosition.x, freePosition.y, freePosition.z);
            freePosition.occupied = true;
        } else {
            //todo what if all 6 positions are occupied?
        }
    }

    getFreePositionInBasket() {
        return this.gameState.positionsForItemsInBasket.sort(() => 0.5 - Math.random()).find(pos => !pos.occupied);
    }

    checkGameOver() {
        const isGameOver = this.gameOverCheck(this.shoppingListAsMap, this.gameState.basketItems);
        if (isGameOver) {
            // alert('GAME OVER');
            // TODO send peer gameover message and finish round for both
            this.dispatchEvent( { type: 'gameOver' } );
        }
    }
}
