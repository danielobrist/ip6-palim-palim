export default {
    models: [
        {
            typeId:     100000,
            path:   './assets/models/duck.glb',
            scale:  0.005,
            type:   'gltf',
            name:   'Entchen',
            pluralName: 'Entchen'
        },
        {
            typeId:     100001,
            path:   './assets/models/apricot.glb',
            scale:  0.009,
            type:   'gltf',
            name:   'Aprikose',
            pluralName: 'Aprikosen'
        },
        {
            typeId:     100002,
            path:   './assets/models/banana.glb',
            scale:  0.1,
            type:   'gltf',
            name:   'Banane',
            pluralName: 'Bananen'
        },
        {
            typeId:     100003,
            path:   './assets/models/apple.glb',
            scale:  0.07,
            type:   'gltf',
            name:   'Apfel',
            pluralName: 'Äpfel'
        },
        {
            typeId:     100004,
            path:   './assets/models/pear.glb',
            scale:  0.08,
            type:   'gltf',
            name:   'Birne',
            pluralName: 'Birnen'
        },
        {
            typeId:     100005,
            path:   './assets/models/egg.glb',
            scale:  0.06,
            type:   'gltf',
            name:   'Ei',
            pluralName: 'Eier'
        }
    ],

    buyerModelsStart: [
        {
            objectId:     200000,
            typeId:       100000,
            startPosition: {
                x:  -2.4,
                y:  -0.1,
                z:  2.5
            }
        },
        {
            objectId:     200001,
            typeId:       100001,
            startPosition: {
                x:  -1.5,
                y:  -0.1,
                z:  2.5
            }
        },
        {
            objectId:     200006,
            typeId:       100001,
            startPosition: {
                x:  -1.2,
                y:  -0.1,
                z:  2.8
            }
        },
        {
            objectId:     200007,
            typeId:       100001,
            startPosition: {
                x:  -1.8,
                y:  -0.1,
                z:  2.8
            }
        },
        {
            objectId:     200002,
            typeId:       100002,
            startPosition: {
                x:  0.5,
                y:  0,
                z:  2.5
            }
        },
        {
            objectId:     200003,
            typeId:       100003,
            startPosition: {
                x:  -0.5,
                y:  -0.1,
                z:  2.5
            }
        },
        {
            objectId:     200004,
            typeId:       100004,
            startPosition: {
                x:  1.5,
                y:  -0.1,
                z:  2.5
            }
        },
        {
            objectId:     200005,
            typeId:       100005,
            startPosition: {
                x:  2.5,
                y:  -0.1,
                z:  2.5
            }
        }
    ],

    gameOverCheck: function(shoppingListMap, basketItemsMap) {
        // checks if all shoppingList items are in the basket

        for (const [key, value] of shoppingListMap.entries()) {
            if (!basketItemsMap.has(key)){
                return false;
            } else if (basketItemsMap.get(key) !== value) {
                return false;
            }
        }
        return true;
    }
};
