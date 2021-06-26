import GameState from "./gameState";

export default class GameStateManager {
    constructor(){
        this.gameState = new GameState()

        // TODO get this dynamically from the config
        this.shoppingListItems = [
            "DuckMesh3",
            "Apple1"
        ]
    }

    addItemToBasket(obj) {
        this.gameState.basketItems.push(obj);
        console.log('ADDED ITEM TO BASKET ARRAY: ' + obj.name)
        // console.log(obj);
        if (this.checkGameOver()) {
            alert('GAME OVER');
            // TODO send peer game over message and finish round
        }
    }

    getBasketItemCount(itemName) {
        let arr = this.gameState.basketItems.filter(item => item.name === itemName);
        return arr.length;
    }

    checkGameOver() {
        //TODO return true if buyerModelsTargets are all in basket

        // if (this.shoppingListItems.length !== this.gameState.basketItems.length) {
        //     return false;
        // }

        let basketNameArray = this.gameState.basketItems.map(item => item.name);
        console.log(basketNameArray);
        // .concat() to not mutate arguments
        // const arr1 = this.shoppingListItems.concat().sort();
        // const arr2 = basketNameArray.concat().sort();

        // for (let i = 0; i < arr1.length; i++) {
        //     if (arr1[i] !== arr2[i]) {
        //         return false;
        //     }
        // }
    
        for (let i = 0; i < this.shoppingListItems.length; i++) {
            if (!basketNameArray.includes(this.shoppingListItems[i])) {
                return false;
            }
        }
    
        return true;
    }
}