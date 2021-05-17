import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export const geometryCube = new THREE.BoxGeometry(0.5, 0.5, 0.5);
export const geometryCuboid = new THREE.BoxGeometry(0.2, 0.1, 0.4);
export const colorGreen = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
export const colorBlue = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
export const colorRed = new THREE.MeshBasicMaterial( { color: 0xff0000 } );