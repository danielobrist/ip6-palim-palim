import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {initScene, initCamera} from './components/mainScene';
//import config from './../data/gameState';
import GameEventManager from './components/gameEventManager.js';
import GameStateManager from './components/gameStateManager';
import GameState from './components/gameState';
import { Vector3 } from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

export {start, updateRemoteObjects, moveRemoteVideoToScene, switchView, startGame2};

// an array of objects to sync
const objectsToSync = new Map();

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

let localScene;
let localCamera;

let draggableObjectsSeller = [];
const interactionObjects = [];

let cube, cube2, cube3;
let duckMesh1, duckMesh2, duckMesh3;
let plane;
let isSeller = false;

let duckMesh;
let apricotMesh, apricotMesh1;
let orbitControls;

let salesObjects = new Map();
let gui;

let gameEventManager;
let selectedObject;
let isMouseDown = false;
let mouse = {x: 0, y: 0};

let gameStateManager = new GameStateManager();

let config;

const start = (isInitiator) => {
        startGame(isInitiator);
}

function startGame(isInitiator) {
    isSeller = isInitiator;
    console.log("Started game with isInitiator = " + isInitiator);
    init();
}

async function startGame2(gameMode) {

    
    await loadConfig(gameMode);
    await init3DObjects();
    if (__ENV__ === 'dev') {
        initControls(isSeller);
    }
    if(__ENV__ === 'dev') {
        initDevThings();
    }
    animate();
}

function init() {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    document.getElementById("appContainer").appendChild( renderer.domElement );

    localScene = initScene();
    localCamera = initCamera(isSeller);


}

async function loadConfig(gameMode) {
    let configFile;

    if(gameMode === "2") {
        configFile = await import('./config/sceneConfig2');
    } else {
        configFile = await import('./config/sceneConfig1');
    }
     
    config = configFile.default;
}

const switchView = (isSeller) => {
    if (isSeller) {
        console.log('changing camera position!');
        localCamera.position.x = 0;
        localCamera.position.y = 6;
        localCamera.position.z = -10;
        localCamera.lookAt( 0, 2, 0 );
    } else {
        localCamera.position.x = 0;
        localCamera.position.y = 6;
        localCamera.position.z = 10;
        localCamera.lookAt( 0, 2, 0 );
    }
    initControls(isSeller);
}

async function init3DObjects() {
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
    for (let i = 0; i < config.models.length; i++) {
        let loadedData = await loader.loadAsync(config.models[i].path);
        loadedData.scene.traverse((o) => {
            if (o.isMesh) {
                let m = new THREE.Mesh();
                o.scale.set(config.models[i].scale, config.models[i].scale, config.models[i].scale);

                m = o;
                
                salesObjects.set(config.models[i].id, m);

            };
        });
    }


    // for (let i = 0; i < GameState.models.length; i++) {
    //     const loader = new GLTFLoader();
    //     let ob = new THREE.Object3D();    
    //     let loadedData = await loader.loadAsync(GameState.models[i].path);
        
        
    //     console.log('------sellsObject: '+GameState.models[i].id+'-------');
        
    //     loadedData.scene.traverse((o) => { 
    //         if (o.isMesh) {
    //             console.log('mesh:');
    //             console.log(o);
    //             ob.add(o);
    //         }
    //     });

    //     console.log('obj:');
    //     console.log(ob);

    //     let m = new THREE.Mesh();
    //     ob.scale.set(GameState.models[i].scale, GameState.models[i].scale, GameState.models[i].scale);

    //     m = ob;
    //     let drago = new DragControls( [m], localCamera, renderer.domElement );
    //     drago.addEventListener( 'drag', function(event) {
    //         gameController.sendGameobjectUpdate(getObjJSON(event.object));
    //         render();
    //     } );
        
    //     salesObjects.set(GameState.models[i].id, m);

    // }

    if (isSeller) { 
        // init seller specific items in local scene
        instantiateSellerObjectsFromJsonArray(config.sellerModelsStart);
    } else {
        // init buyer specific items in local scene
        instantiateSellerObjectsFromJsonArray(config.buyerModelsStart);
    }
    
    renderer.outputEncoding = THREE.sRGBEncoding;

    // init static stuff for both (eg. counter, etc)
    const geometry = new THREE.BoxGeometry( 6, 1, 4 );
    const material = new THREE.MeshStandardMaterial( {color: 0x8B4513} );
    plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    localScene.add( plane );
}

function instantiateSellerObjectsFromJsonArray(jsonArray) {
    for(let i = 0; i < jsonArray.length; i++) {
        let newMesh = salesObjects.get(jsonArray[i].id).clone();
        newMesh.name = jsonArray[i].name;
        newMesh.startPosition = new Vector3(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z)
        newMesh.position.set(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z);
        localScene.add(newMesh);
        objectsToSync.set(newMesh.name, newMesh);
        interactionObjects.push(newMesh);

        // if(__ENV__ === 'dev') {
        //     gui.addFolderWithPositions(newMesh, newMesh.name, -5, 5, 0.05);
        // }
    }
}

const initControls = (isSeller) => {

    gameEventManager = new GameEventManager(
        renderer,
        localCamera,
        isSeller
    );

    // TODO this should be in gameLoopManager
    // gameEventManager.setDraggableObjects(interactionObjects);
    gameEventManager.draggableObjects = interactionObjects;
    console.log(gameEventManager.draggableObjects);
    // console.log(JSON.stringify(gameEventManager.draggableObjects));
    gameEventManager.addEventListener( 'basketAdd', function ( event ) {

        localScene.remove(event.item);
        // TODO scenemanager.show event.item in basket somehow
        // TODO update state
        gameStateManager.addItemToBasket(event.item);
        let count = gameStateManager.getBasketItemCount("DuckMesh3")
        console.log(count);
    } );

    if(__ENV__ === 'dev') {
        // visualize the interaction plane and itemSink
        const planeHelper = new THREE.PlaneHelper( gameEventManager.interactionPlane, 5, 0xffff00 );
        localScene.add(planeHelper);

    }    

    // TODO only in dev if we have a basket
    const boxHelper = new THREE.Box3Helper(gameEventManager.shoppingBasket, 0xff0000);
    localScene.add(boxHelper);

    const boxhelper2 = new THREE.Box3Helper(gameEventManager.selectionSpace, 0x00ffff);
    localScene.add(boxhelper2);

    gameEventManager.setupDispensers();
    gameEventManager.dispensers.forEach((dispenser) => {
        let bh = new THREE.Box3Helper(dispenser, 0x00ff00);
        localScene.add(bh);
    })

}


function initDevThings() {
    orbitControls = new OrbitControls( localCamera, renderer.domElement );
    orbitControls.enabled = false;
    gui = new GUI();
    const orbitControlsFolder = gui.addFolder("OrbitControls");
    orbitControlsFolder.add(orbitControls, 'enabled');
    gui.domElement.parentElement.style.zIndex = "999999";
}

function moveRemoteVideoToScene(isInitiator) {
    setTimeout(() => {
        console.log("------------moveRemoteVideoToScene-------------");

        const webcamRemoteVideo = document.getElementById("remoteVideo");
        const webcamReomoteVideoAspectRatio = webcamRemoteVideo.offsetWidth/webcamRemoteVideo.offsetHeight;
        const remoteVideoWidth = 6;
        const remoteVideoHeight = remoteVideoWidth/webcamReomoteVideoAspectRatio;

        console.log(webcamRemoteVideo);
        console.log("width: " + webcamRemoteVideo.offsetWidth);
        console.log("height: " + webcamRemoteVideo.offsetHeight);

        const remoteVideoGeometry = new THREE.PlaneGeometry( remoteVideoWidth, remoteVideoHeight );
        const remoteVideoMaterial = makeVideoMaterial("remoteVideo");
        const remoteVideoMesh = new THREE.Mesh( remoteVideoGeometry, remoteVideoMaterial );
        if (isInitiator) {
            remoteVideoMesh.position.set(0, remoteVideoHeight / 2, 2);
        } else {
            remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
        }
        localScene.add( remoteVideoMesh );
    }, 2000 );
}

function animate() {
    requestAnimationFrame( animate );
    //cube.rotation.y += 0.01;
    if(orbitControls) {
        orbitControls.update();
    }
    renderer.render( localScene, localCamera );
}

function updateRemoteObjects(data) {
    let obj = JSON.parse(data);
    // console.log('Parsed JSON uuid: ' + obj.uuid + ', positionx: ' + obj.position.x + ', rotationx: ' + obj.rotation._x);

    if(objectsToSync.has(obj.name)) {
        let localElement = localScene.getObjectByName(obj.name);

        localElement.position.x = obj.position.x;
        localElement.position.y = obj.position.y;
        localElement.position.z = obj.position.z;
        localElement.rotation.x = obj.rotation._x;
        localElement.rotation.y = obj.rotation._y;
        localElement.rotation.z = obj.rotation._z;
    } else {
        // creates and add to scene and objectsToSync
        duckMesh.name = obj.name;
        duckMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        let newObj = duckMesh.clone();
        // let newObj = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z), true, draggableObjectsSeller, personalSpace);
        objectsToSync.set(newObj.name, newObj);
        // newObj.position.set(obj.position.x, obj.position.y, obj.position.z);
        localScene.add(newObj);
        // addObjectToDragConrols(newObj);
    }
    
    //TOOD maybe tween/interpolate between positions
}

function makeVideoMaterial(id) {
    let videoElement = document.getElementById(id);
    let videoTexture = new THREE.VideoTexture(videoElement);
  
    let videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      overdraw: true,
      side: THREE.DoubleSide,
    });
  
    return videoMaterial;
  }

function render() {
    renderer.render( localScene, localCamera );
}

