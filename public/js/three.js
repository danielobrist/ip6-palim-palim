import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import {DragControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/TransformControls.js';

// import * as THREE from './../../node_modules/three/build/three.module.js';
export {changeCameraPosition};

let draggableObjects = [];
let control;

const renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("canvasContainer").appendChild( renderer.domElement );


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set(0,1,5);
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 0.5, 2);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );

const cube = new THREE.Mesh( geometry, material );
cube.position.set(0,0,1);
scene.add( cube );
const cube2 = new THREE.Mesh( geometry, material2 );
cube2.position.set(0,0,-1);
scene.add( cube2 );
draggableObjects.push(cube2);

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );


const loader = new GLTFLoader();
renderer.outputEncoding = THREE.sRGBEncoding;

loader.load( '../assets/banana.glb', function ( gltf ) {
    gltf.scene.scale.set(0.2,0.2,0.2);
    gltf.scene.position.y = 1;
    scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
});

scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );


const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
// const controls = new DragControls( [ ...draggableObjects ], camera, renderer.domElement );
// controls.addEventListener( 'drag', render );
control = new TransformControls( camera, renderer.domElement );
control.showY = false;
control.addEventListener( 'change', render );

control.attach(cube2);
scene.add(control);

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

animate();