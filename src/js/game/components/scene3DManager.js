import * as THREE from 'three';
import Helpers from "../../utils/helpers";

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
        this.camera.position.set(0, 6, 10);
        this.camera.lookAt( 0, 2, 0 );

        if (this.isSeller) {
            this.camera.position.z = -10;
        }
    };

    initLight = () => {
        const directionalLightBuyerSide = new THREE.DirectionalLight( 0xffffff, 0.7 );
        directionalLightBuyerSide.position.set(2, 2, 0);
        this.scene.add(directionalLightBuyerSide);

        const directionalLightSellerSide = new THREE.DirectionalLight( 0xffffff, 0.7 );
        directionalLightSellerSide.position.set(-2, 2, 0);
        this.scene.add(directionalLightSellerSide);

        const ambientLight = new THREE.AmbientLight( 0x404040 );
        this.scene.add( ambientLight );

        if(Helpers.isDev()) {
            const helperDirectionalLightBuyerSide = new THREE.DirectionalLightHelper( directionalLightBuyerSide, 5 );
            this.scene.add( helperDirectionalLightBuyerSide );
            const helperDirectionalLightSellerSide = new THREE.DirectionalLightHelper( directionalLightSellerSide, 5 );
            this.scene.add( helperDirectionalLightSellerSide );
        }

    };

    get3DScene = () => {
        return this.scene;
    };

    get3DCamera = () => {
        return this.camera;
    };

}
