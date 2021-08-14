import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import Scene3DManager from "./scene3DManager";
import Helpers from "../helpers";

export default class SceneManager {

    renderer;
    scene3DManager;
    localScene;
    localCamera;
    basketMesh;
    isSeller = false;
    salesObjects = new Map();
    objectsToSync = new Map();
    interactionObjects = [];
    orbitControls;
    gui;
    config;

    pathToBuyerIllustration = './assets/illustrations/buyer.png';
    pathToSellerIllustration = './assets/illustrations/seller.png';

    constructor(){
        this.renderer = this.createAndConfigureRenderer();
        this.addRendererToDOM(this.renderer);

        if (Helpers.isDev()) {
            this.gui = new GUI();
        }
    }

    prepareScene = () => {
        this.scene3DManager = new Scene3DManager();
        this.localScene = this.scene3DManager.get3DScene();
        this.localCamera = this.scene3DManager.get3DCamera();

        this.createStoreCounterAndAddToScene();
        this.createBasketAndAddToScene();
    };

    loadBackground = () => {
        const background = document.getElementById('sceneBackground');
        background.style.backgroundImage = "url('./assets/illustrations/supermarket_v2.jpg')";
    };

    createAndConfigureRenderer = () => {
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.autoClear = false;
        return renderer;
    };

    addRendererToDOM = (renderer) => {
        document.getElementById("appContainer").appendChild(renderer.domElement);
    };

    createStoreCounterAndAddToScene = () => {
        const geometry = new THREE.BoxGeometry( 6, 1, 4 );
        const material = new THREE.MeshStandardMaterial( {color: 0x8B4513} );
        this.plane = new THREE.Mesh( geometry, material );
        this.plane.receiveShadow = true;
        this.localScene.add( this.plane );
    };

    createBasketAndAddToScene = async() => {
        const gltfLoader = new GLTFLoader();
        const basket = await gltfLoader.loadAsync('./assets/models/basket.glb');
        basket.scene.traverse((o) => {
            if (o.isMesh) {
                this.basketMesh = new THREE.Mesh();
                o.scale.set(2, 2, 2);
                const basketMaterial = new THREE.MeshStandardMaterial({color: '#F00'});
                this.basketMesh = o;
                this.basketMesh.material = basketMaterial;
                this.basketMesh.position.set(0,-0.5,-2.6);
            }
        });
        this.localScene.add(this.basketMesh);
    };

    placeVideos = async(videoMode) => {
        console.log("-----placeVideos-----");
        switch (videoMode) {
            case "1":
                this.hideRemoteVideo();
                this.hideLocalVideo();
                this.addBuyerAndSellerIllustration(this.isSeller);
                break;
            case "2":
                this.placeRemoteVideo();
                this.addBuyerAndSellerIllustration(this.isSeller);
                break;
            default:
                await this.moveRemoteVideoToScene(this.isSeller);
                this.hideRemoteVideo();
        }
    };

    placeVirtualCamera = () => {
        if (this.isSeller) {
            this.localCamera.position.x = 0;
            this.localCamera.position.y = 6;
            this.localCamera.position.z = 10;
            this.localCamera.lookAt( 0, 2, 0 );
        } else {
            this.localCamera.position.x = 0;
            this.localCamera.position.y = 6;
            this.localCamera.position.z = -10;
            this.localCamera.lookAt( 0, 2, 0 );
        }
    };

    init3DObjects = async() => {
        const manager = new THREE.LoadingManager();
        // TODO Loading bar/screen https://stackoverflow.com/questions/35575065/how-to-make-a-loading-screen-in-three-js/35584276
        manager.onProgress = (url, itemsLoaded) => {
            console.log( 'Loading file: ' + url + '.\n'+itemsLoaded+' files loaded.' );
        };
        manager.onLoad = () => {
            document.getElementById("appContainer").querySelector('#loading').style.display = 'none';
        };
        const loader = new GLTFLoader(manager);
        // TODO Proper loading
        for (let i = 0; i < this.config.models.length; i++) {
            const loadedData = await loader.loadAsync(this.config.models[i].path);
            loadedData.scene.traverse((o) => {
                if (o.isMesh) {
                    o.scale.set(this.config.models[i].scale, this.config.models[i].scale, this.config.models[i].scale);
                    this.salesObjects.set(this.config.models[i].typeId, o);
                }
            });
        }

        this.instantiateSellerObjectsFromJsonArray(this.config.buyerModelsStart);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    };

    instantiateSellerObjectsFromJsonArray = (jsonArray) => {
        for (let i = 0; i < jsonArray.length; i++) {
            const newMesh = this.salesObjects.get(jsonArray[i].typeId).clone();

            const sphereMesh = this.buildBoundingSphere(newMesh);
            this.localScene.add(sphereMesh);

            sphereMesh.add(newMesh);   // set the acutal item mesh as a child of the bounding sphere

            sphereMesh.startPosition = new Vector3(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z); //todo startPosition = .position
            sphereMesh.position.set(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z);
            sphereMesh.objectId = jsonArray[i].objectId;
            sphereMesh.typeId = jsonArray[i].typeId;

            this.objectsToSync.set(sphereMesh.objectId, sphereMesh);
            this.interactionObjects.push(sphereMesh);

            if(Helpers.isDev()) {
                this.createDatGUIForPosition(sphereMesh, -5, 5, 0.05);
            }
        }
    };

    createDatGUIForPosition = (obj, rangeStart, rangeEnd, step) => {
        const folder = this.gui.addFolder(obj.objectId);
        folder.add(obj.position, "x", rangeStart, rangeEnd, step);
        folder.add(obj.position, "y", rangeStart, rangeEnd, step);
        folder.add(obj.position, "z", rangeStart, rangeEnd, step);
    };

    createVideoMaterialFromDomVideo = (id) => {
        const videoElement = document.getElementById(id);
        const videoTexture = new THREE.VideoTexture(videoElement);

        return new THREE.MeshBasicMaterial({
            map: videoTexture,
            overdraw: true,
            side: THREE.DoubleSide,
        });
    };

    render = () => {
        this.renderer.render( this.localScene, this.localCamera );
    };

    animate = () => {
        requestAnimationFrame( this.animate );
        if(this.orbitControls) {
            this.orbitControls.update();
        }
        this.renderer.render( this.localScene, this.localCamera );
    };

    showVideosAfterGameOver = () => {
        document.getElementById("remoteVideoContainer").classList.remove('deactivatedVideo');
        document.getElementById("localVideoContainer").classList.remove('deactivatedVideo');
        document.getElementById('remoteVideoContainer').classList.remove('gamemode--2');
    };

    
    buildBoundingSphere = (mesh) => {
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere(center));

        let boundingSphereOpacity;
        if(Helpers.isDev()) {
            boundingSphereOpacity = 0.3;
        } else {
            boundingSphereOpacity = 0;
        }
        const m = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            opacity: boundingSphereOpacity,
            transparent: true
        });

        const geometry = new THREE.SphereGeometry(boundingSphere.radius, 32, 32);
        const sphereMesh = new THREE.Mesh(geometry, m);
        sphereMesh.position.copy(center);

        return sphereMesh;
    };

    visualizeTheInteractionPlaneAndItemSink = (gameEventManager) => {
        const planeHelper = new THREE.PlaneHelper( gameEventManager.interactionPlane, 5, 0xffff00 );
        this.localScene.add(planeHelper);

        const basketBoxHelper = new THREE.Box3Helper(gameEventManager.shoppingBasket, 0xff0000);
        this.localScene.add(basketBoxHelper);

        const selectionSpaceBoxHelper = new THREE.Box3Helper(gameEventManager.selectionSpace, 0x00ffff);
        this.localScene.add(selectionSpaceBoxHelper);
    };

    hideRemoteVideo = () => {
        document.getElementById("remoteVideoContainer").classList.add('deactivatedVideo');
    };

    hideLocalVideo = () => {
        document.getElementById("localVideoContainer").classList.add('deactivatedVideo');
    };

    placeRemoteVideo = () => {
        document.getElementById('remoteVideoContainer').classList.add('gamemode--2');
    };

    initDevThings = () => {
        this.orbitControls = new OrbitControls( this.localCamera, this.renderer.domElement );
        this.orbitControls.enabled = false;
        const orbitControlsFolder = this.gui.addFolder("OrbitControls");
        orbitControlsFolder.add(this.orbitControls, 'enabled');
        this.gui.domElement.parentElement.style.zIndex = "999999";
    };

    addBuyerAndSellerIllustration = (isSeller) => {
        let zPosition = 2, xPosition = -0.25;
        let texture;
        if(isSeller) {
            texture = this.loadIllustrationAsTexture(this.pathToSellerIllustration);
            zPosition *= (-1);
            xPosition *= (-1);
        } else {
            texture = this.loadIllustrationAsTexture(this.pathToBuyerIllustration);
        }

        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const geometry = new THREE.BoxGeometry(4, 4.5, 0.000001);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(xPosition, 2.5, zPosition);

        this.localScene.add(mesh);
    };

    loadIllustrationAsTexture = (pathToFile) => {
        return new THREE.TextureLoader().load(pathToFile);
    };

    moveRemoteVideoToScene = () => {

        const webcamRemoteVideo = document.getElementById("remoteVideo");
        const webcamRemoteVideoAspectRatio = webcamRemoteVideo.offsetWidth/webcamRemoteVideo.offsetHeight;
        const remoteVideoWidth = 6;
        const remoteVideoHeight = remoteVideoWidth/webcamRemoteVideoAspectRatio;

        const remoteVideoGeometry = new THREE.PlaneGeometry( remoteVideoWidth, remoteVideoHeight );
        const remoteVideoMaterial = this.createVideoMaterialFromDomVideo("remoteVideo");
        const remoteVideoMesh = new THREE.Mesh( remoteVideoGeometry, remoteVideoMaterial );
        if (this.isSeller) {
            remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
        } else {
            remoteVideoMesh.position.set(0, remoteVideoHeight / 2, 2);
        }
        this.localScene.add( remoteVideoMesh );

    };


    //todo refactoring
    cleanUpScene = () => {
        this.cleanUp(this.localScene);
    };

    //todo refactoring
    cleanUp = (obj) => {
        while(obj.children.length > 0){
            this.cleanUp(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose();

        if(obj.material){
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if(!obj.material[prop])
                    return;
                if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            });
            obj.material.dispose();
        }
    };

    //todo refactoring
    removeFromScene = (objectId) => {
        console.log('REMOVING ITEM WITH ID ' + objectId);
        const temp = this.localScene.getObjectByProperty( 'objectId', objectId );
        console.log(temp);
        // temp.geometry.dispose();
        // temp.material.dispose();
        this.localScene.remove( temp );
    };

    updateRemoteObjects = (data) => {
        const obj = JSON.parse(data);

        if(this.objectsToSync.has(obj.objectId)) {
            const localElement = this.localScene.getObjectByProperty( 'objectId', obj.objectId );

            // TODO nur position = position?
            localElement.position.x = obj.position.x;
            localElement.position.y = obj.position.y;
            localElement.position.z = obj.position.z;
            localElement.rotation.x = obj.rotation._x;
            localElement.rotation.y = obj.rotation._y;
            localElement.rotation.z = obj.rotation._z;
        } 
    }
}
