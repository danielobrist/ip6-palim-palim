import  * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {salesObject} from './salesObject.js';
export {initCube, load3dAsset}

function initCube(geometry, material, position, draggable, draggableObjects, scene) {
    let cube = new salesObject( geometry, material );
    cube.position.set(position.x, position.y, position.z);
    scene.add(cube);
    if(draggable) { draggableObjects.push(cube); }
    return cube;
}

function load3dAsset(loader, path, scale, name, scene) {

    loader.load( path, function ( gltf ) {
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        let temp = gltf.scene;
        temp.name = name;
        scene.add(temp);
        
    }, undefined, function ( error ) {
        console.error( error );
    });

}