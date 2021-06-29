import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/gltfloader';
import GameEventManager from './components/gameEventManager';
import {initScene, initCamera} from './components/mainScene';

export default class SceneManager {
    
    renderer;
    scene;
    camera;

    constructor() {
        this.salesObjects = new Map();
        this.objectsToSync = new Map();
        this.interactionObjects = [];
        console.log("constructor SceneManager");
    }

    initGameScene(isSeller) {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.autoClear = false;
        document.getElementById("appContainer").appendChild( this.renderer.domElement );
    
        this.scene = initScene();
        this.camera = initCamera(isSeller);
    }

    async init3DObjects(isSeller, config) {
        
        await this.load3DAssets(config);

        // init items in local scene
        this.instantiateSellerObjectsFromJsonArray(config.modelsStart);

        if (isSeller) { 
            // init seller specific items in local scene
            this.instantiateSellerObjectsFromJsonArray(config.sellerModelsStart);
        } else {
            // init buyer specific items in local scene
            this.instantiateSellerObjectsFromJsonArray(config.buyerModelsStart);
        }
        
        // TODO maybe move to initGameScene
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    
        // init static stuff for both (eg. counter, etc)
        const geometry = new THREE.BoxGeometry( 6, 1, 4 );
        const material = new THREE.MeshStandardMaterial( {color: 0x8B4513} );
        let plane = new THREE.Mesh( geometry, material );
        plane.receiveShadow = true;
        this.scene.add( plane );
    
        // if(__ENV__ === 'dev') {
        //     initDevThings();
        // }
    
    }

    async load3DAssets(config) {
        for (let i = 0; i < config.models.length; i++) {
            console.log("for-loop: model " + i);
            const loader = new GLTFLoader();
            let loadedData = await loader.loadAsync(config.models[i].path);
            loadedData.scene.traverse((o) => {
                if (o.isMesh) {
                    let m = new THREE.Mesh();
                    o.scale.set(config.models[i].scale, config.models[i].scale, config.models[i].scale);
    
                    m = o;
                    
                    this.salesObjects.set(config.models[i].id, m);
    
                };
            });
        }
    }
    
    instantiateSellerObjectsFromJsonArray(jsonArray) {
        for(let i = 0; i < jsonArray.length; i++) {
            let newMesh = this.salesObjects.get(jsonArray[i].id).clone();
            newMesh.name = jsonArray[i].name;
            newMesh.position.set(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z);
            this.scene.add(newMesh);
            this.objectsToSync.set(newMesh.name, newMesh);
            this.interactionObjects.push(newMesh);
    
            // if(__ENV__ === 'dev') {
            //     gui.addFolderWithPositions(newMesh, newMesh.name, -5, 5, 0.05);
            // }
        }
    }

    switchView = (isSeller) => {
        if (isSeller) {
            this.camera.position.x = 0;
            this.camera.position.y = 6;
            this.camera.position.z = 10;
            this.camera.lookAt( 0, 2, 0 );
        } else {
            console.log('changing camera position!');
            this.camera.position.x = 0;
            this.camera.position.y = 6;
            this.camera.position.z = -10;
            this.camera.lookAt( 0, 2, 0 );
        }
        this.initControls(isSeller);
    }

    initControls = (isSeller) => {

        let gameSync = new gameSync();

        let interactionManager = new GameEventManager (
            this.renderer,
            this.camera,
            gameSync,
            isSeller
        );
    
        interactionManager.setDraggableObjects(this.interactionObjects);
    
        if(__ENV__ === 'dev') {
            // visualize the interaction plane and itemSink
            const planeHelper = new THREE.PlaneHelper( interactionManager.interactionPlane, 5, 0xffff00 );
            this.scene.add(planeHelper);
    
        }    
    
        // TODO only in dev if we have a basket
        const boxHelper = new THREE.Box3Helper(interactionManager.itemSink, 0xff0000);
        this.scene.add(boxHelper);
    }

    moveRemoteVideoToScene(isInitiator) {
        setTimeout(() => {
            console.log("------------moveRemoteVideoToScene-------------");
    
            const webcamRemoteVideo = document.getElementById("remoteVideo");
            const webcamReomoteVideoAspectRatio = webcamRemoteVideo.offsetWidth/webcamRemoteVideo.offsetHeight;
            const remoteVideoWidth = 6;
            const remoteVideoHeight = remoteVideoWidth/webcamReomoteVideoAspectRatio;
    
            const remoteVideoGeometry = new THREE.PlaneGeometry( remoteVideoWidth, remoteVideoHeight );
            const remoteVideoMaterial = makeVideoMaterial("remoteVideo");
            const testMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const remoteVideoMesh = new THREE.Mesh( remoteVideoGeometry, testMaterial );
            if (isInitiator) {
                remoteVideoMesh.position.set(0, remoteVideoHeight / 2, 2);
            } else {
                remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
            }
            this.scene.add( remoteVideoMesh );
        }, 2000 );
    }

    
    animate() {
        requestAnimationFrame( this.animate );
        this.renderer.render( this.scene, this.camera );
    }
}

function makeVideoMaterial(id) {
    let videoElement = document.getElementById(id);
    let videoTexture = new THREE.VideoTexture(videoElement);
  
    let videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      //overdraw: true,
      side: THREE.DoubleSide,
    });
  
    return videoMaterial;
}
