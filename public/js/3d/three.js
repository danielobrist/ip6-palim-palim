import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import {DragControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';

// import * as THREE from './../../node_modules/three/build/three.module.js';
import {initCube, load3dAsset} from './objects3d.js';
import {initSharedScene, initSharedCamera} from './sceneShared.js';
import {initSellerScene, initSellerCamera} from './sceneSeller.js';
// import {salesObject} from './salesObject.js';
import * as DEFAULT_VALUES from './default_values.js';

export {changeCameraPosition, getSceneJSON, updateRemoteObjects};

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

const scene =       initSharedScene();
let camera =        initSharedCamera();
const sceneSeller = initSellerScene();
let cameraSeller =  initSellerCamera();

let cube, cube2, cube3;
let draggableObjects = [];

init();
init3DObjects();
activateDragControls();
animate();

function init() {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    document.getElementById("canvasContainer").appendChild( renderer.domElement );

    //scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );
}

function init3DObjects() {

    cube = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorGreen, new THREE.Vector3(0, 0, 5), true, draggableObjects, scene);
    cube2 = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorBlue, new THREE.Vector3(0, 0, 2), true, draggableObjects, scene);
    cube3 = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(0, 0, 6), true, draggableObjects, sceneSeller);
    
    const loader = new GLTFLoader();
    renderer.outputEncoding = THREE.sRGBEncoding;

    load3dAsset(loader, '../../assets/abricot.gltf', new THREE.Vector3(0.2, 0.2, 0.2), 'apricotTemplate', scene);
    load3dAsset(loader, '../../assets/banana.glb', new THREE.Vector3(0.2, 0.2, 0.2), 'bananaTemplate', scene);

}


function activateDragControls() {
    const controls = new DragControls( [ ...draggableObjects ], camera, renderer.domElement );
    const controlsSeller = new DragControls( [ ...draggableObjects ], cameraSeller, renderer.domElement );

    
    controls.addEventListener( 'drag', render );
    controlsSeller.addEventListener( 'drag', render );
   
    controls.addEventListener('dragend', function(event) {
        if(event.object.position.y > 1.1) {

            let temp = event.object.clone();
            temp.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
            scene.add(temp);

            scene.getObjectById(event.object.id).position.set(event.object.startPosition.x, event.object.startPosition.y, event.object.startPosition.z);

        }
    });
}

function animate() {
    requestAnimationFrame( animate );
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
    renderer.render( sceneSeller, cameraSeller );
}

function changeCameraPosition() {
    console.log('changing camera position!');
    camera.position.z = -5;
    camera.lookAt( 0, 0, 0 );
}

function getSceneJSON() {
    // TODO build and return a JSON from all localObjects, not only cube
    let cubeObj = {id: cube.id, position: cube.position, rotation: cube.rotation};
    let json = JSON.stringify(cubeObj);
    // console.log('JSON:' + json)
    return json;
}

function updateRemoteObjects(data) {
    let obj = JSON.parse(data);
    // console.log('Parsed JSON id: ' + obj.id + ', positionx: ' + obj.position.x + ', rotationx: ' + obj.rotation._x);

    //TOOD tween/interpolate between positions
    cube.position.x = obj.position.x;
    cube.position.y = obj.position.y;
    cube.position.z = obj.position.z;
    cube.rotation.x = obj.rotation._x;
    cube.rotation.y = obj.rotation._y;
    cube.rotation.z = obj.rotation._z;
}

function render() {
    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( sceneSeller, cameraSeller );
}
