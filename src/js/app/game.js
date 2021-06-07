import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GameController} from './game/gameController.js';
import * as Ammo from './physics/ammo.js';
import {initScene, initCamera} from './game/scene';
import GameState from './../data/gameState';
import { Mesh } from 'three';

export {start, getSceneJSON, updateRemoteObjects, moveRemoteVideoToScene};

const gameController = GameController();

// an array of objects to sync
const objectsToSync = new Map();

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

let localScene;
let localCamera;

let dragControl;
let draggableObjectsSeller = [];

let cube, cube2, cube3;
let duckMesh1, duckMesh2, duckMesh3;
let plane;
let isSeller = false;

let duckMesh;
let apricotMesh, apricotMesh1;
// let orbitControls;
let physicsWorld;
let salesObjects = new Map();

const start = (isInitiator) => {
    Ammo().then( function( Ammo ) {
        setupPhysicsWorld(Ammo);

        startGame(isInitiator);
    })
}

const setupPhysicsWorld = (Ammo) => {

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

}

function startGame(isInitiator) {
    isSeller = isInitiator;
    console.log("Started game with isInitiator = " + isInitiator);
    init();
    init3DObjects();
    activateDragControls();
    animate();
}

function init() {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    document.getElementById("appContainer").appendChild( renderer.domElement );

    localScene = initScene();
    localCamera =  initCamera(isSeller);

    // orbitControls = new OrbitControls( localCamera, renderer.domElement );

}

async function init3DObjects() {
    
    for (let i = 0; i < GameState.models.length; i++) {
        const loader = new GLTFLoader();
        let loadedData = await loader.loadAsync(GameState.models[i].path);
        loadedData.scene.traverse((o) => {
            if (o.isMesh) {
                let m = new THREE.Mesh();
                o.scale.set(GameState.models[i].scale, GameState.models[i].scale, GameState.models[i].scale);

                m = o;
                let drago = new DragControls( [m], localCamera, renderer.domElement );
                drago.addEventListener( 'drag', function(event) {
                    gameController.sendGameobjectUpdate(getObjJSON(event.object));
                    render();
                } );
                
                salesObjects.set(GameState.models[i].id, m);

            };
        });
    }

    if (isSeller) { 
        // init seller specific items in local scene
        instantiateSellerObjectsFromJsonArray(GameState.sellerModelsStart);
    } else {
        // init buyer specific items in local scene
        instantiateSellerObjectsFromJsonArray(GameState.buyerModelsStart);
    }
    
    renderer.outputEncoding = THREE.sRGBEncoding;

    // init static stuff for both (eg. counter, etc)
    // load3dAsset(loader, '../../assets/abricot.gltf', new THREE.Vector3(0.2, 0.2, 0.2), 'apricotTemplate', personalSpace);
    // load3dAsset(loader, '../../assets/banana.glb', new THREE.Vector3(0.2, 0.2, 0.2), 'bananaTemplate', personalSpace);
    const geometry = new THREE.PlaneGeometry( 6, 4 );
    const material = new THREE.MeshBasicMaterial( {color: 0x8B4513, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    localScene.add( plane );

    if(__ENV__ === 'dev') {
        initDevThings();
    }

}

function instantiateSellerObjectsFromJsonArray(jsonArray) {
    for(let i = 0; i < jsonArray.length; i++) {
        let newMesh = salesObjects.get(jsonArray[i].id);
        newMesh.name = jsonArray[i].name;
        newMesh.position.set(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z);
        localScene.add(newMesh);
        objectsToSync.set(newMesh.name, newMesh);
        addObjectToDragConrols(newMesh);
    }
}

function initDevThings() {
    let gui = new DatGUIPalimPalim();
    gui.load(plane, localCamera, duckMesh3);
}

function moveRemoteVideoToScene() {
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
        remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
        localScene.add( remoteVideoMesh );
    }, 2000 );
}


function activateDragControls() {

    
    dragControl = new DragControls( [ ...draggableObjectsSeller ], localCamera, renderer.domElement );
    //dragControl.transforGroup = true;
    dragControl.addEventListener( 'drag', function(event) {
        gameController.sendGameobjectUpdate(getObjJSON(event.object));
        render();
    } );
   
    // dragControl.addEventListener('dragend', function(event) {
    //     if(event.object.position.y > -1.5) {

    //         let temp = event.object.clone();
    //         temp.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
    //         temp.name = temp.uuid;
    //         personalSpace.add(temp);
    //         objectsToSync.set(temp.name, temp);
    //         addObjectToDragConrols(temp);
    //     }
    //     event.object.position.set(event.object.startPosition.x, event.object.startPosition.y, event.object.startPosition.z);
    // });
}

function animate() {
    requestAnimationFrame( animate );
    //cube.rotation.y += 0.01;
    // orbitControls.update();
    renderer.render( localScene, localCamera );
}

function getObjJSON(object) {
    let obj = {name: object.name, position: object.position, rotation: object.rotation};
    let json = JSON.stringify(obj);
    console.log('JSON:' + json)
    return json;
}

function getSceneJSON() {
    // TODO build and return a JSON from all localObjects, not only cube
    let cubeObj = {uuid: cube.uuid, position: cube.position, rotation: cube.rotation};
    // let json = JSON.stringify(cubeObj);
    let json = JSON.stringify(draggableObjectsSeller);
    // console.log('JSON:' + json)
    return json;
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
        addObjectToDragConrols(newObj);
    }
    
    //TOOD maybe tween/interpolate between positions
}

function addObjectToDragConrols(obj) {
    draggableObjectsSeller.push(obj);
    dragControl = new DragControls([...draggableObjectsSeller], localCamera, renderer.domElement).addEventListener('drag', function(event) {
        gameController.sendGameobjectUpdate(getObjJSON(event.object));
        render();
    });
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

