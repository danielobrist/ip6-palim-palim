import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/gltfloader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {initScene, initCamera} from './components/mainScene';
//import config from './../data/gameState';
import GameEventManager from './components/gameEventManager.js';
// import DatGUI from './managers/datGUI';

export {updateRemoteObjects};

export default class GameManager {
    config;
    isSeller;
    
    constructor(gameStateManager, sceneManager) {
        this.gameStateManager = gameStateManager;
        this.sceneManager = sceneManager;
    }

    initGame(isInitiator) {
        this.isSeller = !isInitiator;
        
        console.log("Started game with isInitiator = " + isInitiator);
        this.sceneManager.initGameScene(this.isSeller);
    }

    async startGameMode(gameMode) {
        this.sceneManager.moveRemoteVideoToScene(this.isInitiator);
        this.sceneManager.switchView(this.isSeller);
        this.config = await loadConfig(gameMode);

        if (__ENV__ === 'dev') {
            this.sceneManager.initControls(this.isSeller);
        }
        await this.sceneManager.init3DObjects(this.isSeller, this.config);
        this.sceneManager.animate();
    }

    preload() {

    }

}

async function loadConfig(gameMode, config) {
    let configFile;

    if(gameMode === "2") {
        configFile = await import('./config/sceneConfig2');
    } else {
        configFile = await import('./config/sceneConfig1');
    }
     
    return configFile.default;
}




// an array of objects to sync
const objectsToSync = new Map();



let localScene;
let localCamera;

const interactionObjects = [];

let isSeller = false;

let duckMesh;
// let orbitControls;
let salesObjects = new Map();
let gui;

let interactionManager;



// function init() {
//     // orbitControls = new OrbitControls( localCamera, renderer.domElement );
// }

// function initDevThings() {
//     gui = new DatGUI();
//     // gui.load();
// }



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



