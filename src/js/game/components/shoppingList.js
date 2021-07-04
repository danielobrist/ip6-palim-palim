export { writeShoppingList, strikeThroughPurchasedItemsFromShoppingList }

const visualShoppingList = document.getElementById('shoppingList');
const visualShoppingListContainer = document.getElementById('shoppingListContainer');
let shoppingItems, hideShoppingList;


const writeShoppingList = (shoppingList, models) => {

    shoppingItems = models;
    visualShoppingListContainer.style.display = "block";

    for (const [key, value] of shoppingList.entries()) {
        createHtmlElementForShoppingItem(key, value.count);
    }

};

const getNameOfShoppingItem = (typeId, count) => {
    for(let i = 0; i < shoppingItems.length; i++) {
        if(shoppingItems[i].typeId === typeId) {
            if(count === 1) {
                return shoppingItems[i].name;
            }
            return shoppingItems[i].pluralName;
        }
    }

    return null;
};

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

const strikeThroughPurchasedItemsFromShoppingList = (typeId) => {
    if(visualShoppingListContainer.classList.contains("visible")) {
        if(strikeThroughSpecificItemFromShoppingList(typeId)) {
            clearTimeout(hideShoppingList);
        }
    } else if(strikeThroughSpecificItemFromShoppingList(typeId)) {
        visualShoppingListContainer.classList.add("visible");
    }

    hideShoppingList = window.setTimeout(() => {
        visualShoppingListContainer.classList.remove("visible");
    }, 5000);
};

const strikeThroughSpecificItemFromShoppingList = (typeId) => {
    const shoppingListItem = document.getElementById('shoppingListItem--' + typeId);

    if(shoppingListItem && shoppingListItemIsNotStrikeThrough(shoppingListItem)) {
        const count = parseInt(shoppingListItem.dataset.count);
        if (count === 1) {
            shoppingListItem.classList.add('strikeThrough');
        } else {
            shoppingListItem.dataset.count = String(count - 1);
        }
        return true;
    }

    return false;
};

const shoppingListItemIsNotStrikeThrough = (shoppingListItem) => {
    if(shoppingListItem.dataset.count > 1) {
        return true;
    }
    return shoppingListItem.dataset.count === "1" && !shoppingListItem.classList.contains('strikeThrough');
};

const createHtmlElementForShoppingItem = (typeId, count) => {
    const singleShoppingItemContainer = document.createElement("div");
    const singleShoppingItem = document.createElement("p");
    singleShoppingItemContainer.append(singleShoppingItem);
    singleShoppingItem.innerHTML = getNameOfShoppingItem(typeId, count);
    singleShoppingItem.dataset.count = count;
    singleShoppingItem.id = 'shoppingListItem--' + typeId;
    visualShoppingList.append(singleShoppingItemContainer);
};
