import * as THREE from 'three';
import GameState from "./gameState";
import {strikeThroughPurchasedItemsFromShoppingList} from './shoppingList';

export default class GameStateManager extends THREE.EventDispatcher {
    constructor(config){
        super();

        this.gameState = new GameState();
        this.gameOverCheck = config.gameOverCheck;
        this.shoppingList = config.shoppingList;
    }

    addItemToBasket(item) {
        // check if basketItems contains an item with this name as key
        let basketItem = this.gameState.basketItems.get(item.typeId);
        console.log(basketItem);
        if (basketItem !== undefined) {
            // update the count of the basketItem
            basketItem.count += 1;
            this.gameState.basketItems.set(item.typeId, basketItem);
        } else {
            // create and set new basketItem
            basketItem = {
                count: 1
            };
            this.gameState.basketItems.set(item.typeId, basketItem);
        }
        console.log('ADDED ITEM TO BASKET: ' + item.name + ' WITH ID ' + item.objectId);
        strikeThroughPurchasedItemsFromShoppingList(item.typeId);
        this.checkGameOver();
    }

    checkGameOver() {
        let gameOver = this.gameOverCheck(this.shoppingList, this.gameState.basketItems)
        if (gameOver) {
            // alert('GAME OVER');
            // TODO send peer gameover message and finish round for both
            this.dispatchEvent( { type: 'gameOver' } );
        }
    }
}
