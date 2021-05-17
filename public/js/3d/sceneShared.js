import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export {initSharedScene, initSharedCamera}

let scene;

function initSharedScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 1500, 2100);

    initLight();

    return scene;
}

function initSharedCamera() {
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set(0,1,5);
    camera.lookAt( 0, 0, 0 );

    return camera;
}

function initLight() {
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add(directionalLight);
}