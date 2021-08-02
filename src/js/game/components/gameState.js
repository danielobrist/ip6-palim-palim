export default class GameState {
    constructor() {
        this.basketItems = new Map();
        this.positionsForItemsInBasket = [
            {
                x: -0.5,
                y: -0.2,
                z: -2.35,
                occupied: false
            },
            {
                x: 0,
                y: -0.2,
                z: -2.35,
                occupied: false
            },
            {
                x: 0.5,
                y: -0.2,
                z: -2.35,
                occupied: false
            },
            {
                x: -0.5,
                y: -0.2,
                z: -2.85,
                occupied: false
            },
            {
                x: 0,
                y: -0.2,
                z: -2.85,
                occupied: false
            },
            {
                x: 0.5,
                y: -0.2,
                z: -2.85,
                occupied: false
            },

        ];
    }
}
