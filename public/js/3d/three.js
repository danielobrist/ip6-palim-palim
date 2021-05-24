import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import {DragControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';
import {GameController} from '../game/gameController.js';

import {initCube, load3dAsset} from './objects3d.js';
import {initScene, initCamera} from './scene.js';
import * as DEFAULT_VALUES from './default_values.js';

export {startGame, getSceneJSON, updateRemoteObjects};

const gameController = GameController();

// an array of objects to sync
const objectsToSync = new Map();
const personalSpace = new THREE.Object3D();

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

let localScene;
let localCamera;

let dragControl;
let draggableObjectsSeller = [];

let cube, cube2, cube3;
let isSeller = false;



function startGame(isInitiator) {
    isSeller = isInitiator;
    
    init();
    init3DObjects();
    activateDragControls();
    animate();
}

function init() {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    document.getElementById("canvasContainer").appendChild( renderer.domElement );

    localScene = initScene();
    localCamera =  initCamera();

    localScene.add(personalSpace);

    if (isSeller) {
        changeCameraPosition();
    }
}

function init3DObjects() {

    if (isSeller) { 
        // init seller specific items in local scene
        cube = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(0, -3.5, 0), true, draggableObjectsSeller, personalSpace);
        cube2 = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(1, -3.5, 0), true, draggableObjectsSeller, personalSpace);
        cube.name = "cube0";
        cube2.name = "cube2";
        objectsToSync.set(cube.name, cube);
        objectsToSync.set(cube2.name, cube);

    } else {
        // init buyer specific items in local scene
        cube3 = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(-1, -3.5, 0), true, draggableObjectsSeller, personalSpace);
        cube3.name = "cube3";
        objectsToSync.set(cube3.name, cube3);
    }

    const loader = new GLTFLoader();
    renderer.outputEncoding = THREE.sRGBEncoding;

    // init static stuff for both (eg. counter, etc)
    // load3dAsset(loader, '../../assets/abricot.gltf', new THREE.Vector3(0.2, 0.2, 0.2), 'apricotTemplate', personalSpace);
    // load3dAsset(loader, '../../assets/banana.glb', new THREE.Vector3(0.2, 0.2, 0.2), 'bananaTemplate', personalSpace);
    const geometry = new THREE.PlaneGeometry( 5, 3, 5 );
    const material = new THREE.MeshBasicMaterial( {color: 0x4A4A4A, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = 180;
    localScene.add( plane );
}


function activateDragControls() {
    
    dragControl = new DragControls( [ ...draggableObjectsSeller ], localCamera, renderer.domElement );
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
    renderer.render( localScene, localCamera );
}

function changeCameraPosition() {
    console.log('changing camera position!');
    isSeller = true;
    localCamera.position.z = -10;
    localCamera.lookAt( 0, 0, 0 );
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
        // creates and add to objectsToSync
        // TODO makes a red clone, need to pass color along in JSON
        let newObj = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z), true, draggableObjectsSeller, personalSpace);
        newObj.name = obj.name;
        objectsToSync.set(newObj.name, newObj);

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

function render() {

    renderer.render( localScene, localCamera );
}

