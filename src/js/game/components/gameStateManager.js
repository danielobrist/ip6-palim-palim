import * as THREE from 'three';
import GameState from "./gameState";
import {strikeThroughPurchasedItemsFromShoppingList} from './shoppingList';

export default class GameStateManager extends THREE.EventDispatcher {
    constructor(config){
        super();

        this.gameState = new GameState();
        this.gameOverCheck = config.gameOverCheck;
        this.shoppingList = this.generateShoppingList(config.buyerModelsStart);
    }

    generateShoppingList(possibleShoppingItems) {
        const numberOfElementsInShoppingList = getRandomInt(2,5);
        const shoppingListItems = reduceArrayToSomeRandomItems(possibleShoppingItems, numberOfElementsInShoppingList);
        const shoppingList = new Map();

        shoppingListItems.forEach((shoppingItem) => {
            if(!shoppingList.get(shoppingItem.typeId)) {
                shoppingList.set(shoppingItem.typeId, 1);
            } else {
                shoppingList.set(shoppingItem.typeId, shoppingList.get(shoppingItem.typeId) + 1);
            }
        });

        console.log("shoppingList: ");
        console.log(shoppingList);
        return shoppingList;

    }

    addItemToBasket(item) {
        if (this.gameState.basketItems.get(item.typeId)) {
            this.gameState.basketItems.set(item.typeId, this.gameState.basketItems.get(item.typeId) + 1);
        } else {
            this.gameState.basketItems.set(item.typeId, 1);
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

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

const reduceArrayToSomeRandomItems = (array, numberOfItems) => {
    return array.sort(() => 0.5 - Math.random()).slice(0, numberOfItems);
};
