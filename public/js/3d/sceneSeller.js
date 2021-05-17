import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export {initSellerScene, initSellerCamera}


function initSellerScene() {
    const sceneSeller = new THREE.Scene();
    sceneSeller.background = null;

    return sceneSeller;
}

function initSellerCamera() {
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set(0,0,-10);
    camera.lookAt( 0, 0, 0 );

    return camera;
}