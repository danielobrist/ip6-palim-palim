
const renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("canvasContainer").appendChild( renderer.domElement );


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial( { color: 0xff00ff } );

const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add( line );  

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();