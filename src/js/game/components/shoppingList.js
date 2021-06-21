import GameState from '../config/sceneConfig1';

export { writeShoppingList }

const visualShoppingList = document.getElementById('shoppingList');
const visualShoppingListContainer = document.getElementById('shoppingListContainer');

const writeShoppingList = (isSeller) => {

    if(isSeller) {
        visualShoppingListContainer.style.display = "block";

        let targetShoppingItems = GameState.buyerModelsTarget;
        
        targetShoppingItems.forEach(function(element) {
            let singleShoppingItem = document.createElement("p");
            singleShoppingItem.innerHTML = getNameOfShoppingItem(element);
            visualShoppingList.append(singleShoppingItem);
        });   
    }
}

function getNameOfShoppingItem(id) {
    for(let i = 0; i < GameState.models.length; i++) {
        if(GameState.models[i].id == id) {
            return GameState.models[i].name;
        }
    }

    return null;
}

let hideShoppingList;

visualShoppingListContainer.addEventListener("click", function() {
    
    if(visualShoppingListContainer.classList.contains("visible")) {
        clearTimeout(hideShoppingList);
        visualShoppingListContainer.classList.remove("visible");
    } else {
        visualShoppingListContainer.classList.toggle("visible");

        hideShoppingList = window.setTimeout(() => {
            visualShoppingListContainer.classList.remove("visible");
        }, 10000);
    }
});