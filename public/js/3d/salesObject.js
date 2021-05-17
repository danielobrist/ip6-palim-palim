import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export {salesObject};

class salesObject extends THREE.Mesh {
    setStartPosition(startPosition) {
        this.startPosition = startPosition;
    }
}