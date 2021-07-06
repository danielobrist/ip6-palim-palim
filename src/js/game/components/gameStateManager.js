import * as THREE from 'three';
import GameState from "./gameState";

export default class GameStateManager extends THREE.EventDispatcher {
    constructor(config){
        super();

        this.gameState = new GameState();
        this.gameOverCheck = config.gameOverCheck;
        this.shoppingList = this.generateShoppingList(config.buyerModelsStart);
    }

    generateShoppingList(possibleShoppingItems) {
        const numberOfElementsInShoppingList = getRandomIntInRange(3,5);
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
        const isGameOver = this.gameOverCheck(this.shoppingList, this.gameState.basketItems);
        if (isGameOver) {
            // alert('GAME OVER');
            // TODO send peer gameover message and finish round for both
            this.dispatchEvent( { type: 'gameOver' } );
        }
    }
}

//todo move to a helper class
const getRandomIntInRange = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

//todo move to a helper class
const reduceArrayToSomeRandomItems = (array, numberOfItems) => {
    return array.sort(() => 0.5 - Math.random()).slice(0, numberOfItems);
};
