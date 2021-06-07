export default {
    models: [
        {
            id:     518168,
            path:   './assets/models/duck.gltf',
            scale:  0.01,
            type:   'gltf'
        },
        {
            id:     889985,
            path:   './assets/models/apricot.gltf',
            scale:  0.02,
            type:   'gltf'
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
                x:  1.5,
                y:  0,
                z:  2
            },
            name:   'DuckMesh3'
        },
        {
            id:     889985,
            startPosition: {
                x:  -1.5,
                y:  0,
                z:  2
            },
            name:   'Apricot1'
        }
    ]
};
