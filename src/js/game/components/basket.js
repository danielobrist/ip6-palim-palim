export default class Basket {
    constructor() {
        this.items = new Map();
        this.positionsForItems = [
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

    addItem = (item) => {
        this.addItemToList(item);
        this.addItemVisual(item);
    };

    addItemVisual = (item) => {
        const freePosition = this.getFreePositionInBasket();

        if(freePosition) {
            item.scale.set(0.75, 0.75, 0.75);
            item.position.set(freePosition.x, freePosition.y, freePosition.z);
            freePosition.occupied = true;
        } else {
            //todo what if all 6 positions are occupied?
        }
    };

    getFreePositionInBasket = () => {
        return this.positionsForItems.sort(() => 0.5 - Math.random()).find(pos => !pos.occupied);
    };

    addItemToList = (item) => {
        if (this.items.get(item.typeId)) {
            this.items.set(item.typeId, this.items.get(item.typeId) + 1);
        } else {
            this.items.set(item.typeId, 1);
        }
    };
}
