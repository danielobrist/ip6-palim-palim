import * as THREE from 'three';
import GameState from "./gameState";

export default class GameStateManager extends THREE.EventDispatcher {
    constructor(config){
        super();

        this.gameState = new GameState();
        this.gameOverCheck = config.gameOverCheck;
        this.shoppingList = config.shoppingList;
        // TODO get this dynamically from the config
        // this.shoppingListMap = new Map();
        // this.shoppingListMap.set(
        //     'DuckMesh3', 
        //     {
        //         name: "DuckMesh3", 
        //         count: 1
        //     }
        // );
        // this.shoppingListMap.set(
        //     'Apple1', 
        //     {
        //         name: "Apple1", 
        //         count: 1
        //     }
        // );
    }

    addItemToBasket(item) {
        // check if basketItems contains an item with this name as key
        let basketItem = this.gameState.basketItems.get(item.name);
        console.log(basketItem);
        if (basketItem !== undefined) {
            // update the count of the basketItem
            basketItem.count += 1;
            this.gameState.basketItems.set(item.name, basketItem);
        } else {
            // create and set new basketItem
            basketItem = {
                name: item.name,
                count: 1
            };
            this.gameState.basketItems.set(item.name, basketItem);
        }
        console.log('ADDED ITEM TO BASKET: ' + item.name)
        this.checkGameOver();
    }

    checkGameOver() {
        let gameOver = this.gameOverCheck(this.shoppingList, this.gameState.basketItems)
        if (gameOver === true) {
            alert('GAME OVER');
            // TODO send peer gameover message and finish round for both
            this.dispatchEvent( { type: 'gameOver' } );
        }
    }
}