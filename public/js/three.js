import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
// import * as THREE from './../../node_modules/three/build/three.module.js';
import {isInitiator} from './main.js';


const renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("canvasContainer").appendChild( renderer.domElement );


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set(0,1,5);
if(!isInitiator) { 
    console.log('isInitiator is false, changing camera.position.z');
    camera.position.z = -5;
}
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

function animate() {
    requestAnimationFrame( animate );
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}

animate();