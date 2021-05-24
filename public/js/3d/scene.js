import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export {initScene, initCamera}

let scene;

function initScene() {
    scene = new THREE.Scene();
    scene.background = null;

    initLight();

    return scene;
}

function initCamera(isSeller) {
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    if (isSeller) {
        console.log('changing camera position!');
        camera.position.z = -10;
        camera.lookAt( 0, 0, 0 );
    } else {
        camera.position.set(0,0,10);
        camera.lookAt( 0, 0, 0 );
    }
    return camera;
}

function initLight() {
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add(directionalLight);
}
