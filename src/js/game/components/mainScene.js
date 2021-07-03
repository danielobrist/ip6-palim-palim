import * as THREE from 'three';

export {initScene, initCamera}

let scene;

function initScene() {
    scene = new THREE.Scene();
    scene.background = null; //new THREE.Color( 'skyblue' );

    initLight();

    return scene;
}

function initCamera(isSeller) {
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    if (isSeller) {
        console.log('changing camera position!');
        camera.position.x = 0;
        camera.position.y = 6;
        camera.position.z = -10;
        camera.lookAt( 0, 2, 0 );
    } else {
        camera.position.x = 0;
        camera.position.y = 6;
        camera.position.z = 10;
        camera.lookAt( 0, 2, 0 );
    }
    return camera;
}

function initLight() {
    const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight1.position.set(2, 2, 0);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight2.position.set(2, 2, -20);
    directionalLight2.castShadow = true;
    // scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight3.position.set(2, 2, 20);
    // scene.add(directionalLight3);

    if(__ENV__ === 'dev') {
        const helper = new THREE.DirectionalLightHelper( directionalLight1, 5 );
        scene.add( helper );
        const helper1 = new THREE.DirectionalLightHelper( directionalLight2, 5 );
        scene.add( helper1 );
        const helper2 = new THREE.DirectionalLightHelper( directionalLight3, 5 );
        scene.add( helper2 );
    }
  
}
