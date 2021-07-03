export { writeShoppingList }

const visualShoppingList = document.getElementById('shoppingList');
const visualShoppingListContainer = document.getElementById('shoppingListContainer');
let shoppingItems;

const writeShoppingList = (shoppingList, models) => {

    shoppingItems = models;
    visualShoppingListContainer.style.display = "block";

    for (const [key, value] of shoppingList.entries()) {
        let singleShoppingItem = document.createElement("p");
        singleShoppingItem.innerHTML = value.count + " " + getNameOfShoppingItem(key, value.count);
        visualShoppingList.append(singleShoppingItem);
    }

}

function getNameOfShoppingItem(typeId, count) {
    for(let i = 0; i < shoppingItems.length; i++) {
        if(shoppingItems[i].typeId == typeId) {
            if(count == 1) {
                return shoppingItems[i].name;
            } else {
                return shoppingItems[i].pluralName;
            }
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
