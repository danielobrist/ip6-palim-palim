import GameState from './../../data/gameState';

export { writeShoppingList }

function writeShoppingList() {
    let visualShoppingList = document.getElementById('shoppingList');

    let targetShoppingItems = GameState.buyerModelsTarget;
    
    targetShoppingItems.forEach(function(element) {
        let singleShoppingItem = document.createElement("p");
        singleShoppingItem.innerHTML = getNameOfShoppingItem(element);
        visualShoppingList.append(singleShoppingItem);
    });   
}

function getNameOfShoppingItem(id) {
    for(let i = 0; i < GameState.models.length; i++) {
        if(GameState.models[i].id == id) {
            return GameState.models[i].name;
        }
    }

    return null;
}