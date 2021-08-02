// import * as THREE from 'three';
// import TWEEN from '@tweenjs/tween.js';
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// import {initScene, initCamera} from './components/mainScene';
// //import config from './../data/gameState';
// import GameEventManager from './components/gameEventManager.js';
// import GameStateManager from './components/gameStateManager';
// import AudioManager from './components/audioManager';
// import GameState from './components/gameState';
// import { Vector3 } from 'three';
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
// import { GameSync } from './components/gameSync';
// import {isInitiator} from "../videoChat/videoChat";
// import {strikeThroughPurchasedItemsFromShoppingList, writeShoppingList} from './components/shoppingList';
// import party from "party-js";
//
// export {updateRemoteObjects, moveRemoteVideoToScene, startGame, showGameOver, cleanUpScene, placeVideos, returnToGameModeSelection, removeFromScene, hideOverlay};
//
// // an array of objects to sync
// const objectsToSync = new Map();
//
// const renderer = new THREE.WebGLRenderer({
//     alpha: true
// });
//
//
// let localScene;
// let localCamera;
//
// let draggableObjectsSeller = [];
// const interactionObjects = [];
//
// let cube, cube2, cube3;
// let duckMesh1, duckMesh2, duckMesh3;
// let plane;
// let isSeller = false;
//
// let basketMesh;
// let duckMesh;
// let apricotMesh, apricotMesh1;
// let orbitControls;
//
// let salesObjects = new Map();
// let gui;
//
// let gameEventManager;
// let audioManager;
//
// let selectedObject;
// let isMouseDown = false;
// let mouse = {x: 0, y: 0};
//
// let gameStateManager;
//
// let config;
//
// async function startGame(gameMode) {
//     await loadConfig(gameMode);
//     loadBackground();
//     if (__ENV__ === 'dev') {
//         gui = new GUI();
//     }
//     await init3DObjects();
//     if (__ENV__ === 'dev') {
//         initControls(isSeller);
//         initDevThings();
//     }
//     document.getElementById("appContainer").classList.remove('deactivated');
//     animate();
// }
//
//
//
//
//
//
