import Helpers from "../helpers";

export default class ShoppingListManager {

    shoppingListAsMap;
    hideShoppingList;
    visualShoppingList = document.getElementById('shoppingList');
    visualShoppingListContainer = document.getElementById('shoppingListContainer');
    allModelsInCurrentGameMode;

    constructor() {
        this.addClickEventListenerToVisualShoppingListContainer();
    }

    generateShoppingListAsMap = (possibleShoppingItems) => {
        const numberOfElementsInShoppingList = Helpers.getRandomIntInRange(3,5);
        const shoppingListItems = Helpers.reduceArrayToSomeRandomItems(possibleShoppingItems, numberOfElementsInShoppingList);
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

    writeShoppingListToDom = (shoppingList, allModelsInCurrentGameMode) => {

        this.allModelsInCurrentGameMode = allModelsInCurrentGameMode;
        this.visualShoppingListContainer.classList.remove("hidden");

        for (const [key, value] of shoppingList.entries()) {
            this.createHtmlElementForShoppingItem(key, value);
        }
    };

    createHtmlElementForShoppingItem = (typeId, count) => {
        const singleShoppingItemContainer = document.createElement("div");
        const singleShoppingItem = document.createElement("p");
        singleShoppingItemContainer.append(singleShoppingItem);
        singleShoppingItem.innerHTML = this.getNameOfShoppingItem(typeId, count);
        singleShoppingItem.dataset.count = count;
        singleShoppingItem.id = 'shoppingListItem--' + typeId;
        this.visualShoppingList.append(singleShoppingItemContainer);
    };

    getNameOfShoppingItem = (typeId, count) => {
        for (let i = 0; i < this.allModelsInCurrentGameMode.length; i++) {
            if (this.allModelsInCurrentGameMode[i].typeId === typeId) {
                if (count === 1) {
                    return this.allModelsInCurrentGameMode[i].name;
                }
                return this.allModelsInCurrentGameMode[i].pluralName;
            }
        }

        return null;
    };

    strikeThroughPurchasedItems = (typeId) => {
        if(this.visualShoppingListContainer.classList.contains("visible")) {
            if(this.strikeThroughSpecificItem(typeId)) {
                clearTimeout(this.hideShoppingList);
            }
        } else if(this.strikeThroughSpecificItem(typeId)) {
            this.visualShoppingListContainer.classList.add("visible");
        }

        this.hideShoppingList = window.setTimeout(this.removeVisualShoppingList, 5000);

    };

    strikeThroughSpecificItem = (typeId) => {
        const shoppingListItem = document.getElementById('shoppingListItem--' + typeId);

        if(shoppingListItem && !this.isItemStrikeThrough(shoppingListItem)) {
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

    isItemStrikeThrough = (shoppingListItem) => {
        if(shoppingListItem.dataset.count > 1) {
            return true;
        }
        return shoppingListItem.dataset.count === "1" && !shoppingListItem.classList.contains('strikeThrough');
    };

    addClickEventListenerToVisualShoppingListContainer = () => {
        this.visualShoppingListContainer.addEventListener("click", () => {

            if(this.visualShoppingListContainer.classList.contains("visible")) {
                clearTimeout(this.hideShoppingList);
                this.visualShoppingListContainer.classList.remove("visible");
            } else {
                this.visualShoppingListContainer.classList.add("visible");

                this.hideShoppingList = window.setTimeout(this.removeVisualShoppingList, 10000);
            }
        });
    };

    removeVisualShoppingList = () => {
        this.visualShoppingListContainer.classList.remove("visible");
    }

}
