import {initCamera, initScene} from "./mainScene";
import AudioManager from "./audioManager";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {isInitiator} from "../../videoChat/videoChat";
import GameEventManager from "./gameEventManager";
import {strikeThroughPurchasedItemsFromShoppingList} from "./shoppingListManager";
import {Vector3} from "three";
import party from "party-js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GUI} from "three/examples/jsm/libs/dat.gui.module";

export default class SceneManager {

    renderer;
    localScene;
    localCamera;
    audioManager;
    basketMesh;
    isSeller;
    salesObjects = new Map();
    objectsToSync = new Map();
    interactionObjects = [];
    orbitControls;
    gui;
    config;

    constructor(){

        this.renderer = this.createRendererAndSetInitConfiguration();
        this.addRendererToDOM(this.renderer);

        if (__ENV__ === 'dev') {
            this.gui = new GUI();
        }
    }

    prepareScene = () => {
        this.localScene = initScene();
        this.localCamera = initCamera();
        this.audioManager = new AudioManager(this.localCamera);

        this.createStoreCounterAndAddToScene();
        this.createBasketAndAddToScene();
    };

    loadBackground = () => {
        console.log("loadBackground");

        let background = document.getElementById('sceneBackground');
        background.style.backgroundImage = "url('./assets/illustrations/supermarket_v2.jpg')";
    };

    createRendererAndSetInitConfiguration = () => {
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
        let basket = await gltfLoader.loadAsync('./assets/models/basket.glb');
        basket.scene.traverse((o) => {
            if (o.isMesh) {
                this.basketMesh = new THREE.Mesh();
                o.scale.set(2, 2, 2);
                let basketMaterial = new THREE.MeshStandardMaterial({color: '#F00'});
                this.basketMesh = o;
                this.basketMesh.material = basketMaterial;
                this.basketMesh.position.set(0,-0.5,-2.6);
            };
        });
        this.localScene.add(this.basketMesh);
    };

    placeVideos = async(videoMode) => {
        console.log('-----placeVideos-----');
        switch (videoMode) {
            case "1":
                this.hideRemoteVideo();
                this.hideLocalVideo();
                this.addBuyerAndSellerIllustration(isInitiator);
                break;
            case "2":
                this.placeRemoteVideo();
                this.addBuyerAndSellerIllustration(isInitiator);
                break;
            default:
                await this.moveRemoteVideoToScene(isInitiator);
                this.hideRemoteVideo();
        }
    };

    switchViewUsingIsSeller = () => {
        if (this.isSeller) {
            console.log('changing camera position!');
            this.localCamera.position.x = 0;
            this.localCamera.position.y = 6;
            this.localCamera.position.z = -10;
            this.localCamera.lookAt( 0, 2, 0 );
        } else {
            this.localCamera.position.x = 0;
            this.localCamera.position.y = 6;
            this.localCamera.position.z = 10;
            this.localCamera.lookAt( 0, 2, 0 );
        }
    };

    init3DObjects = async() => {
        const manager = new THREE.LoadingManager();
        // TODO Loading bar/screen https://stackoverflow.com/questions/35575065/how-to-make-a-loading-screen-in-three-js/35584276
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        }
        manager.onLoad = () => {
            document.getElementById("appContainer").querySelector('#loading').style.display = 'none';
        }
        const loader = new GLTFLoader(manager);
        // TODO Proper loading
        for (let i = 0; i < this.config.models.length; i++) {
            let loadedData = await loader.loadAsync(this.config.models[i].path);
            loadedData.scene.traverse((o) => {
                if (o.isMesh) {
                    let m = new THREE.Mesh();
                    o.scale.set(this.config.models[i].scale, this.config.models[i].scale, this.config.models[i].scale);

                    m = o;

                    this.salesObjects.set(this.config.models[i].typeId, m);

                };
            });
        }

        this.instantiateSellerObjectsFromJsonArray(this.config.buyerModelsStart);
        console.log("INSTANTIATE OBJECTS : " + this.isSeller);

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

            if(__ENV__ === 'dev') {
                //gui.addFolderWithPositions(sphereMesh, sphereMesh.name, -5, 5, 0.05);
                const rangeStart = -5, rangeEnd = 5, step = 0.05;
                const folder = this.gui.addFolder(sphereMesh.objectId);
                folder.add(sphereMesh.position, "x", rangeStart, rangeEnd, step);
                folder.add(sphereMesh.position, "y", rangeStart, rangeEnd, step);
                folder.add(sphereMesh.position, "z", rangeStart, rangeEnd, step);
            }
        }
    };

    //Todo move to helper class
    createVideoMaterialFromDomElementWithId = (id) => {
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
    }

    updateRemoteObjects = (data) => {
        const obj = JSON.parse(data);
        // console.log('Parsed JSON uuid: ' + obj.uuid + ', positionx: ' + obj.position.x + ', rotationx: ' + obj.rotation._x);

        if(objectsToSync.has(obj.objectId)) {
            const localElement = this.localScene.getObjectByProperty( 'objectId', obj.objectId );

            localElement.position.x = obj.position.x;
            localElement.position.y = obj.position.y;
            localElement.position.z = obj.position.z;
            localElement.rotation.x = obj.rotation._x;
            localElement.rotation.y = obj.rotation._y;
            localElement.rotation.z = obj.rotation._z;
        } else {
            // creates and add to scene and objectsToSync
            duckMesh.objectId = obj.objectId;
            duckMesh.name = obj.name;
            duckMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
            let newObj = duckMesh.clone();
            // let newObj = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z), true, draggableObjectsSeller, personalSpace);
            objectsToSync.set(newObj.objectId, newObj);
            // newObj.position.set(obj.position.x, obj.position.y, obj.position.z);
            localScene.add(newObj);
            // addObjectToDragConrols(newObj);
        }

        //Todo maybe tween/interpolate between positions
    }

    animate = () => {
        requestAnimationFrame( this.animate );
        if(this.orbitControls) {
            this.orbitControls.update();
        }
        this.renderer.render( this.localScene, this.localCamera );
    };

    hideOverlay = () => {
        document.getElementById('overlay').classList.add('whileGameIsRunning');
        this.audioManager.playPalimSound();
    };

    showVideos = () => {
        document.getElementById("remoteVideoContainer").classList.remove('deactivatedVideo');
        document.getElementById("localVideoContainer").classList.remove('deactivatedVideo');
        document.getElementById('remoteVideoContainer').classList.remove('gamemode--2');
    };

    returnToGameModeSelection = () => {
        document.getElementById('gameOverScreen').classList.add('deactivated');
        document.getElementById('gameModeScreen').classList.remove('deactivated');
    };


    cleanUpScene = () => {
        cleanUp(this.localScene);
    };

    cleanUp = (obj) => {
        while(obj.children.length > 0){
            cleanUp(obj.children[0]);
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
            })
            obj.material.dispose();
        }
    };

    removeFromScene = (objectId) => {
        console.log('REMOVING ITEM WITH ID ' + objectId);
        let temp = localScene.getObjectByProperty( 'objectId', objectId );
        console.log(temp);
        // temp.geometry.dispose();
        // temp.material.dispose();
        localScene.remove( temp );
    };


    buildBoundingSphere = (mesh) => {
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere(center));

        let boundingSphereOpacity;
        if(__ENV__ === 'dev') {
            boundingSphereOpacity = 0.3;
        } else {
            boundingSphereOpacity = 0
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
        this.orbitControls = new OrbitControls( localCamera, renderer.domElement );
        this.orbitControls.enabled = false;
        const orbitControlsFolder = this.gui.addFolder("OrbitControls");
        orbitControlsFolder.add(orbitControls, 'enabled');
        this.gui.domElement.parentElement.style.zIndex = "999999";
    };

    addBuyerAndSellerIllustration = (isSeller) => {
        let zPosition = 2, xPosition = -0.25;
        let texture;
        if(isSeller) {
            texture = this.loadSellerIllustrationAsTexture();
        } else {
            texture = this.loadBuyerIllustrationAsTexture();
            zPosition = zPosition*(-1);
            xPosition = xPosition*(-1);
        }

        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const geometry = new THREE.BoxGeometry(4, 4.5, 0.000001); //todo change to PlaneGeometry (currentrly doesnt work in scene of buyer)
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(xPosition, 2.5, zPosition);

        localScene.add(mesh);
    };

    loadBuyerIllustrationAsTexture = () => {
        return new THREE.TextureLoader().load( './assets/illustrations/buyer.png' );
    };

    loadSellerIllustrationAsTexture = () => {
        return new THREE.TextureLoader().load( './assets/illustrations/seller.png' );
    };

    moveRemoteVideoToScene = () => {

        const webcamRemoteVideo = document.getElementById("remoteVideo");
        const webcamReomoteVideoAspectRatio = webcamRemoteVideo.offsetWidth/webcamRemoteVideo.offsetHeight;
        const remoteVideoWidth = 6;
        const remoteVideoHeight = remoteVideoWidth/webcamReomoteVideoAspectRatio;

        const remoteVideoGeometry = new THREE.PlaneGeometry( remoteVideoWidth, remoteVideoHeight );
        const remoteVideoMaterial = this.createVideoMaterialFromDomElementWithId("remoteVideo");
        const remoteVideoMesh = new THREE.Mesh( remoteVideoGeometry, remoteVideoMaterial );
        if (this.isSeller) {
            remoteVideoMesh.position.set(0, remoteVideoHeight / 2, 2);
        } else {
            remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
        }
        this.localScene.add( remoteVideoMesh );

    }
}
