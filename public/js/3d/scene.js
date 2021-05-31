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
        camera.position.x = 0;
        camera.position.y = 5;
        camera.position.z = -10;
        camera.lookAt( 0, 0, 0 );
    } else {
        camera.position.x = 0;
        camera.position.y = 5;
        camera.position.z = 10;
        camera.lookAt( 0, 0, 0 );
    }
    return camera;
}

function initLight() {
    const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight1.position.set(2, 2, 0);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight2.position.set(2, 2, -20);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight3.position.set(2, 2, 20);
    scene.add(directionalLight3);
}
