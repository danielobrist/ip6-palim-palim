export default {
    models: [
        {
            id:     518168,
            path:   './assets/models/duck.glb',
            scale:  0.005,
            type:   'gltf',
            name:   'Entchen'
        },
        {
            id:     889985,
            path:   './assets/models/apricot.glb',
            scale:  0.009,
            type:   'gltf',
            name:   'Aprikose'
        },
        {
            id:     515156,
            path:   './assets/models/banana.glb',
            scale:  0.16,
            type:   'gltf',
            name:   'Banane'
        },
        {
            id:     515157,
            path:   './assets/models/apple.glb',
            scale:  0.07,
            type:   'gltf',
            name:   'Apfel'
        },
        {
            id:     515158,
            path:   './assets/models/pear.glb',
            scale:  0.1,
            type:   'gltf',
            name:   'Aprikose'
        },
        {
            id:     515159,
            path:   './assets/models/egg.glb',
            scale:  0.06,
            type:   'gltf',
            name:   'Ei'
        }
    ],
    sellerModelsStart: [
        {
            id:     518168,
            startPosition: {
                x:  -1.5,
                y:  0,
                z:  -2
            },
            name:   'DuckMesh1'
        },
        {
            id:     518168,
            startPosition: {
                x:  0,
                y:  0,
                z:  -2
            },
            name:   'DuckMesh2'
        }
    ],

    buyerModelsStart: [
        {
            id:     518168,
            startPosition: {
                x:  -2.4,
                y:  -0.6,
                z:  2.5
            },
            name:   'DuckMesh3'
        },
        {
            id:     889985,
            startPosition: {
                x:  -1.5,
                y:  -0.5,
                z:  2.3
            },
            name:   'Apricot1'
        },
        {
            id:     515156,
            startPosition: {
                x:  0.5,
                y:  -0.5,
                z:  2.5
            },
            name:   'Banana1'
        },
        {
            id:     515157,
            startPosition: {
                x:  -0.5,
                y:  -0.5,
                z:  2.3
            },
            name:   'Apple1'
        },
        {
            id:     515158,
            startPosition: {
                x:  1.5,
                y:  -0.5,
                z:  2.2
            },
            name:   'Pear1'
        },
        {
            id:     515159,
            startPosition: {
                x:  2.5,
                y:  -0.5,
                z:  2.5
            },
            name:   'Egg1'
        }
    ],

    buyerModelsTarget: [
        515159,
        515157,
        515156
    ],
    gameOverCheck: function(shoppingListMap, basketItemsMap) {
        // checks if all shoppingList items are in the basket

        // console.log(shoppingListMap);
        // console.log(basketItemsMap);

        for (const [key, value] of shoppingListMap.entries()) {
            if (!basketItemsMap.has(key)){
                return false;
            } else {
                let basketItem = basketItemsMap.get(key);
                if (basketItem.count !== value.count) {
                    return false;
                }
            }
        }
        return true;
    },
    shoppingList: new Map([
        ['DuckMesh3', 
            {
                name: "DuckMesh3", 
                count: 1
            }
        ], 
        ['Apple1', 
            {
                name: "Apple1", 
                count: 1
            }
        ]
    ])
};
