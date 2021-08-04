import * as THREE from 'three';

export default class Scene3DManager {

    scene;
    camera;
    isSeller;

    constructor(isSeller) {
        this.isSeller = isSeller;

        this.initScene();
        this.initCamera();
        this.initLight();
    }

    initScene = () => {
        this.scene = new THREE.Scene();
        this.scene.background = null;
    };

    initCamera = () => {
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
        if (this.isSeller) {
            console.log('changing camera position!');
            this.camera.position.x = 0;
            // this.camera.position.set(0, 6, -10);
            this.camera.position.y = 6;
            this.camera.position.z = -10;
            this.camera.lookAt( 0, 2, 0 );
        } else {
            this.camera.position.x = 0;
            this.camera.position.y = 6;
            this.camera.position.z = 10;
            this.camera.lookAt( 0, 2, 0 );
        }
    };

    initLight = () => {
        const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 0.7 );
        directionalLight1.position.set(2, 2, 0);
        this.scene.add(directionalLight1);

        const directionalLight4 = new THREE.DirectionalLight( 0xffffff, 0.7 );
        directionalLight1.position.set(-2, 2, 0);
        this.scene.add(directionalLight4);

        const ambientLight = new THREE.AmbientLight( 0x404040 );
        this.scene.add( ambientLight );

        //todo isDev() in Helpers
        if(__ENV__ === 'dev') {
            const helper = new THREE.DirectionalLightHelper( directionalLight1, 5 );
            scene.add( helper );
            const helper1 = new THREE.DirectionalLightHelper( directionalLight2, 5 );
            scene.add( helper1 );
            const helper2 = new THREE.DirectionalLightHelper( directionalLight3, 5 );
            scene.add( helper2 );
        }

    };

    get3DScene = () => {
        return this.scene;
    };

    get3DCamera = () => {
        return this.camera;
    };

}
