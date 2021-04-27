import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import {DragControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/TransformControls.js';

// import * as THREE from './../../node_modules/three/build/three.module.js';
export {changeCameraPosition};

let draggableObjects = [];
let control;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    alpha: true
});
let camera;
let cube, cube2;
const geometry = new THREE.BoxGeometry(1, 0.5, 2);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
let apricotTemplate;

init();
init3DObjects();
activateDragControls();
// activateTransformControls();
animate();

function init() {
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("canvasContainer").appendChild( renderer.domElement );

    initCamera();
    initLight();

    //scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );
}

function initCamera() {
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set(0,1,5);
    camera.lookAt( 0, 0, 0 );    
}

function initLight() {
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );
}

function init3DObjects() {

    cube = new THREE.Mesh( geometry, material );
    cube.position.set(0,0,1);
    scene.add( cube );
    draggableObjects.push(cube);
    cube2 = new THREE.Mesh( geometry, material2 );
    cube2.position.set(0,0,-1);
    scene.add( cube2 );
    draggableObjects.push(cube2);

    const loader = new GLTFLoader();
    renderer.outputEncoding = THREE.sRGBEncoding;

    loader.load( '../assets/banana.glb', function ( gltf ) {
        gltf.scene.scale.set(0.2,0.2,0.2);
        gltf.scene.position.y = 1;
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    });

    loadApricot();


    // loader.load( '../assets/abricot.gltf', function ( gltf ) {
    //     gltf.scene.scale.set(0.2,0.2,0.2);
    //     gltf.scene.position.y = 1;
    //     gltf.scene.position.x = 1.1;
    //     scene.add( gltf.scene );
        
    //     let bla = gltf.scene.clone();
    //     bla.position.y = 1;
    //     bla.position.x = 2;
    //     scene.add(bla);

    //     console.log(bla);

    // }, undefined, function ( error ) {
    //     console.error( error );
    // });
}

function loadApricot() {
    const loader = new GLTFLoader();
    renderer.outputEncoding = THREE.sRGBEncoding;

    loader.load( '../assets/abricot.gltf', function ( gltf ) {
        gltf.scene.scale.set(0.2,0.2,0.2);
        // return gltf.scene;
        apricotTemplate = gltf.scene;
        apricotTemplate.name = "apricotTemplate";
        scene.add(apricotTemplate);
        console.log(apricotTemplate);
        draggableObjects.push(apricotTemplate);
        // gltf.scene.name = "hallihallo";
        // scene.add( gltf.scene );
        // console.log(gltf.scene);
        // apricotLoaded = true;
    }, undefined, function ( error ) {
        console.error( error );
    });

}

function activateDragControls() {
    const controls = new DragControls( [ ...draggableObjects ], camera, renderer.domElement );
    let startPosition;

    controls.addEventListener( 'drag', render );
    // controls.addEventListener('drag', function(event) {
    //     if(event.object.position.y > 1.2 && oldYPositionOfDraggedObject <= 1.2) {
    //         console.log('hello');
    //     }
    //     oldYPositionOfDraggedObject = event.object.position.y;  
    // });
    controls.addEventListener('dragstart', function(event) {
        startPosition = event.object.position;
    });
    controls.addEventListener('dragend', function(event) {
        if(event.object.position.y > 1.1) {
           
            console.log(event.object);
            // let bla = scene.getObjectById(event.object.id).clone();
            // bla.geometry.scale(1.2,1.2,1.2);
            // scene.getObjectById(bla.id);

            // let bla = scene.getObjectByName("hallihallo").clone();
            // console.log(bla.geometry.parameters.height);
            
            let apricot = apricotTemplate.clone();
            apricot.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
            scene.add(apricot);

            // scene.getObjectById(event.object.id).position.set(startPosition.x, startPosition.y, startPosition.z);
            scene.getObjectById(event.object.id).position.set(0,0,-1);
        }
    });
}

function activateTransformControls() {
    control = new TransformControls( camera, renderer.domElement );
    control.showY = false;
    control.addEventListener( 'change', render );

    control.attach(cube2);
    scene.add(control);
}

function animate() {
    requestAnimationFrame( animate );
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}

function changeCameraPosition() {
    console.log('changing camera position!');
    camera.position.z = -5;
    camera.lookAt( 0, 0, 0 );
}

function render() {
    renderer.render( scene, camera );
}