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

// export {prepareScene, updateRemoteObjects, moveRemoteVideoToScene, switchView, startGame, showGameOver, cleanUpScene, placeVideos, returnToGameModeSelection, removeFromScene, hideOverlay};

// // an array of objects to sync
// const objectsToSync = new Map();

// const renderer = new THREE.WebGLRenderer({
//     alpha: true
// });


// let localScene;
// let localCamera;

// let draggableObjectsSeller = [];
// const interactionObjects = [];

// let cube, cube2, cube3;
// let duckMesh1, duckMesh2, duckMesh3;
// let plane;
// let isSeller = false;

// let basketMesh;
// let duckMesh;
// let apricotMesh, apricotMesh1;
// let orbitControls;

// let salesObjects = new Map();
// let gui;

// let gameEventManager;
// let audioManager;

// let selectedObject;
// let isMouseDown = false;
// let mouse = {x: 0, y: 0};

// let gameStateManager;

// let config;

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

// const loadBackground = () => {
//     let background = document.getElementById('sceneBackground');
//     background.style.backgroundImage = "url('./assets/illustrations/supermarket_v2.jpg')";
// }

// const hideOverlay = () => {
//     document.getElementById('overlay').classList.add('whileGameIsRunning');
//     audioManager.playPalimSound();
// }

// const showGameOver = (showRestart) => {
//     playConfetti();
//     audioManager.playWinSound();
    
//     setTimeout(function(){ 
//         document.getElementById('overlay').classList.remove('whileGameIsRunning');
//         document.getElementById('gameOverScreen').classList.remove('deactivated');
//         showVideos();
//         if (showRestart) {
//             document.getElementById('restartGameButton').addEventListener('click', () => {
//                 //todo cleanUpScene();
//                 gameEventManager.sendGoToGameModeSelection();
//                 returnToGameModeSelection();
//             });
//         } else {
//             document.getElementById('restartGameButton').classList.add('deactivated');
//         }
//     }, 2500);
    
// }

// const playConfetti = () => {
//     const element = document.getElementById("appContainer")
//     party.confetti(element,{
//         count: party.variation.range(200, 400),
//         /**
//          * Whether the debugging mode should be enabled.
//          */
//         debug: false,
//         /**
//          * The amount of gravity to apply to particles in the scene, in pixels.
//          * Note that this value is positive by default, since the y-axis increases
//          * downwards in a DOM.
//          */
//         gravity: 800,
//         /**
//          * The z-index to place the DOM containers at.
//          */
//         zIndex: 99999,
//     });
// }

// const showVideos = () => {
//     document.getElementById("remoteVideoContainer").classList.remove('deactivatedVideo');
//     document.getElementById("localVideoContainer").classList.remove('deactivatedVideo');
//     document.getElementById('remoteVideoContainer').classList.remove('gamemode--2');
// }

// const returnToGameModeSelection = () => {
//     document.getElementById('gameOverScreen').classList.add('deactivated');
//     document.getElementById('gameModeScreen').classList.remove('deactivated');
// }

// const prepareScene = async () => {
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( window.innerWidth, window.innerHeight );
//     renderer.autoClear = false;
//     document.getElementById("appContainer").appendChild( renderer.domElement );

//     localScene = initScene();
//     localCamera = initCamera(isSeller);

//     audioManager = new AudioManager(localCamera);

//     // init static stuff for both (eg. counter, etc)
//     const geometry = new THREE.BoxGeometry( 6, 1, 4 );
//     const material = new THREE.MeshStandardMaterial( {color: 0x8B4513} );
//     plane = new THREE.Mesh( geometry, material );
//     plane.receiveShadow = true;
//     localScene.add( plane );
    
//     const staticStuffLoader = new GLTFLoader();
//     let basket = await staticStuffLoader.loadAsync('./assets/models/basket.glb');
//     basket.scene.traverse((o) => {
//         if (o.isMesh) {
//             basketMesh = new THREE.Mesh();
//             o.scale.set(2, 2, 2);
//             let basketMaterial = new THREE.MeshStandardMaterial({color: '#F00'});  
//             basketMesh = o;
//             basketMesh.material = basketMaterial;
//             basketMesh.position.set(0,-0.5,-2.6);
//         };
//     });
//     localScene.add(basketMesh);

// }

// const cleanUpScene = () => {
//     cleanUp(localScene);
// }

// const cleanUp = (obj) => {
//     while(obj.children.length > 0){ 
//         cleanUp(obj.children[0]);
//         obj.remove(obj.children[0]);
//       }
//       if(obj.geometry) obj.geometry.dispose();
    
//       if(obj.material){ 
//         //in case of map, bumpMap, normalMap, envMap ...
//         Object.keys(obj.material).forEach(prop => {
//           if(!obj.material[prop])
//             return;
//           if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')                                  
//             obj.material[prop].dispose();                                                      
//         })
//         obj.material.dispose();
//       }
// }

// const removeFromScene = (objectId) => {
//     console.log('REMOVING ITEM WITH ID ' + objectId);
//     let temp = localScene.getObjectByProperty( 'objectId', objectId );
//     console.log(temp);
//     // temp.geometry.dispose();
//     // temp.material.dispose();
//     localScene.remove( temp );
// } 

// async function loadConfig(gameMode) {
//     let configFile;

//     if(gameMode === "2") {
//         configFile = await import('./config/sceneConfig2');
//     } else {
//         configFile = await import('./config/sceneConfig1');
//     }

//     config = configFile.default;
//     gameStateManager = new GameStateManager(config);
//     gameStateManager.addEventListener('gameOver', (event) => {
//         gameEventManager.sendGameOver();
//         showGameOver(true);  //TODO refactor this, true should be !isSeller
//     });

//     if(isInitiator) {
//         writeShoppingList(gameStateManager.shoppingList, config.models);
//     }

//     // gameEventManager.addEventListener( 'basketAdd', function (event) {
//     //     localScene.remove(event.item);
//     //     // TODO scenemanager.show event.item in basket somehow
//     //     // TODO update state
//     //     gameStateManager.addItemToBasket(event.item);

//     // } );
// }

// const switchView = (isSeller) => {
//     if (isSeller) {
//         console.log('changing camera position!');
//         localCamera.position.x = 0;
//         localCamera.position.y = 6;
//         localCamera.position.z = -10;
//         localCamera.lookAt( 0, 2, 0 );
//     } else {
//         localCamera.position.x = 0;
//         localCamera.position.y = 6;
//         localCamera.position.z = 10;
//         localCamera.lookAt( 0, 2, 0 );
//     }
//     initControls(isSeller);
// }

// async function init3DObjects() {
//     const manager = new THREE.LoadingManager();
//     // TODO Loading bar/screen https://stackoverflow.com/questions/35575065/how-to-make-a-loading-screen-in-three-js/35584276
//     manager.onProgress = (url, itemsLoaded, itemsTotal) => {
//         console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
//     }
//     manager.onLoad = () => {
//         document.getElementById("appContainer").querySelector('#loading').style.display = 'none';
//     }
//     const loader = new GLTFLoader(manager);
//     // TODO Proper loading
//     for (let i = 0; i < config.models.length; i++) {
//         let loadedData = await loader.loadAsync(config.models[i].path);
//         loadedData.scene.traverse((o) => {
//             if (o.isMesh) {
//                 let m = new THREE.Mesh();
//                 o.scale.set(config.models[i].scale, config.models[i].scale, config.models[i].scale);

//                 m = o;
                
//                 salesObjects.set(config.models[i].typeId, m);

//             };
//         });
//     }

//     instantiateSellerObjectsFromJsonArray(config.buyerModelsStart);
//     console.log("INSTANTIATE OBJECTS : " + isSeller);

//     renderer.outputEncoding = THREE.sRGBEncoding;


// }

// const instantiateSellerObjectsFromJsonArray = (jsonArray) => {
//     for (let i = 0; i < jsonArray.length; i++) {
//         const newMesh = salesObjects.get(jsonArray[i].typeId).clone();

//         const sphereMesh = buildBoundingSphere(newMesh);
//         localScene.add(sphereMesh);

//         sphereMesh.add(newMesh);   // set the acutal item mesh as a child of the bounding sphere

//         sphereMesh.startPosition = new Vector3(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z); //todo startPosition = .position
//         sphereMesh.position.set(jsonArray[i].startPosition.x, jsonArray[i].startPosition.y, jsonArray[i].startPosition.z);
//         sphereMesh.objectId = jsonArray[i].objectId;
//         sphereMesh.typeId = jsonArray[i].typeId;

//         objectsToSync.set(sphereMesh.objectId, sphereMesh);
//         interactionObjects.push(sphereMesh);
        
//         if(__ENV__ === 'dev') {
//             //gui.addFolderWithPositions(sphereMesh, sphereMesh.name, -5, 5, 0.05);
//             const rangeStart = -5, rangeEnd = 5, step = 0.05;
//             const folder = gui.addFolder(sphereMesh.objectId);
//             folder.add(sphereMesh.position, "x", rangeStart, rangeEnd, step);
//             folder.add(sphereMesh.position, "y", rangeStart, rangeEnd, step);
//             folder.add(sphereMesh.position, "z", rangeStart, rangeEnd, step);
//         }
//     }
// }

// const buildBoundingSphere = (mesh) => {
//     const boundingBox = new THREE.Box3().setFromObject(mesh);
//     const center = new THREE.Vector3();
//     boundingBox.getCenter(center);

//     const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere(center));

//     let boundingSphereOpacity;
//     if(__ENV__ === 'dev') {
//         boundingSphereOpacity = 0.3;
//     } else {
//         boundingSphereOpacity = 0
//     }
//     const m = new THREE.MeshStandardMaterial({
//             color: 0xffffff,
//             opacity: boundingSphereOpacity,
//             transparent: true
//         });

//     const geometry = new THREE.SphereGeometry(boundingSphere.radius, 32, 32);
//     const sphereMesh = new THREE.Mesh(geometry, m);
//     sphereMesh.position.copy(center);

//     return sphereMesh;
// }

// const initControls = (isSeller) => {

//     gameEventManager = new GameEventManager(
//         renderer,
//         localCamera,
//         isSeller,
//         basketMesh
//     );

//     // TODO this should be in gameLoopManager
//     // gameEventManager.setDraggableObjects(interactionObjects);
//     gameEventManager.draggableObjects = interactionObjects;
//     console.log(gameEventManager.draggableObjects);
//     // console.log(JSON.stringify(gameEventManager.draggableObjects));
//     gameEventManager.addEventListener( 'basketAdd', function (event) {

//         //localScene.remove(event.item);

//         // TODO update state

//         gameStateManager.addItemToListOfItemsInBasket(event.item);
//         gameStateManager.addItemToVisualBasket(event.item);
//         console.log('ADDED ITEM TO BASKET: ' + event.item.name + ' WITH ID ' + event.item.objectId);
//         gameStateManager.checkGameOver();

//         strikeThroughPurchasedItemsFromShoppingList(event.item.typeId);
//         audioManager.playCompleteTaskSound();
//     } );
//     gameEventManager.addEventListener( 'itemRemove', function (event) {
//         // let selectedObjectPlaceholder = event.item.clone();

//         // console.log(event.item.startPosition);
//         // selectedObjectPlaceholder.position.set(event.item.startPosition);
//         // selectedObjectPlaceholder.material.opacity = 0.5;
//         // localScene.add(selectedObjectPlaceholder);
//     });

//     if(__ENV__ === 'dev') {
//         visualizeTheInteractionPlaneAndItemSink();
//     }

// }

// const visualizeTheInteractionPlaneAndItemSink = () => {
//     const planeHelper = new THREE.PlaneHelper( gameEventManager.interactionPlane, 5, 0xffff00 );
//     localScene.add(planeHelper);

//     const basketBoxHelper = new THREE.Box3Helper(gameEventManager.shoppingBasket, 0xff0000);
//     localScene.add(basketBoxHelper);

//     const selectionSpaceBoxHelper = new THREE.Box3Helper(gameEventManager.selectionSpace, 0x00ffff);
//     localScene.add(selectionSpaceBoxHelper);
// }

// const placeVideos = async (videoMode, isInitiator) => {
//     console.log('-----placeVideos-----');
//     switch (videoMode) {
//         case "1":
//             hideRemoteVideo();
//             hideLocalVideo();
//             addBuyerAndSellerIllustration(isInitiator);
//             break;
//         case "2":
//             placeRemoteVideo();
//             addBuyerAndSellerIllustration(isInitiator);
//             break;
//         default:
//             await moveRemoteVideoToScene(isInitiator);
//             hideRemoteVideo();
//     }
// };

// const hideRemoteVideo = () => {
//     document.getElementById("remoteVideoContainer").classList.add('deactivatedVideo');
// };

// const hideLocalVideo = () => {
//     document.getElementById("localVideoContainer").classList.add('deactivatedVideo');
// };

// const placeRemoteVideo = () => {
//     document.getElementById('remoteVideoContainer').classList.add('gamemode--2');
// };

// function initDevThings() {
//     orbitControls = new OrbitControls( localCamera, renderer.domElement );
//     orbitControls.enabled = false;
//     const orbitControlsFolder = gui.addFolder("OrbitControls");
//     orbitControlsFolder.add(orbitControls, 'enabled');
//     gui.domElement.parentElement.style.zIndex = "999999";
// }

// const addBuyerAndSellerIllustration = (isSeller) => {
//     let zPosition = 2, xPosition = -0.25;
//     let texture;
//     if(isSeller) {
//         texture = loadSellerIllustrationAsTexture();
//     } else {
//         texture = loadBuyerIllustrationAsTexture();
//         zPosition = zPosition*(-1);
//         xPosition = xPosition*(-1);
//     }

//     const material = new THREE.MeshBasicMaterial( { map: texture } );
//     const geometry = new THREE.BoxGeometry(4, 4.5, 0.000001); //todo change to PlaneGeometry (currentrly doesnt work in scene of buyer)
//     const mesh = new THREE.Mesh(geometry, material);

//     mesh.position.set(xPosition, 2.5, zPosition);

//     localScene.add(mesh);
// };

// const loadBuyerIllustrationAsTexture = () => {
//     return new THREE.TextureLoader().load( './assets/illustrations/buyer.png' );
// };

// const loadSellerIllustrationAsTexture = () => {
//     return new THREE.TextureLoader().load( './assets/illustrations/seller.png' );
// };

// function moveRemoteVideoToScene(isInitiator) {

//         const webcamRemoteVideo = document.getElementById("remoteVideo");
//         const webcamReomoteVideoAspectRatio = webcamRemoteVideo.offsetWidth/webcamRemoteVideo.offsetHeight;
//         const remoteVideoWidth = 6;
//         const remoteVideoHeight = remoteVideoWidth/webcamReomoteVideoAspectRatio;

//         const remoteVideoGeometry = new THREE.PlaneGeometry( remoteVideoWidth, remoteVideoHeight );
//         const remoteVideoMaterial = makeVideoMaterial("remoteVideo");
//         const remoteVideoMesh = new THREE.Mesh( remoteVideoGeometry, remoteVideoMaterial );
//         if (isInitiator) {
//             remoteVideoMesh.position.set(0, remoteVideoHeight / 2, 2);
//         } else {
//             remoteVideoMesh.position.set(0, remoteVideoHeight/2, -2);
//         }
//         localScene.add( remoteVideoMesh );

// }

// function animate() {
//     requestAnimationFrame( animate );
//     //cube.rotation.y += 0.01;
//     if(orbitControls) {
//         orbitControls.update();
//     }
//     renderer.render( localScene, localCamera );
// }

// function updateRemoteObjects(data) {
//     const obj = JSON.parse(data);
//     // console.log('Parsed JSON uuid: ' + obj.uuid + ', positionx: ' + obj.position.x + ', rotationx: ' + obj.rotation._x);

//     if(objectsToSync.has(obj.objectId)) {
//         const localElement = localScene.getObjectByProperty( 'objectId', obj.objectId );

//         localElement.position.x = obj.position.x;
//         localElement.position.y = obj.position.y;
//         localElement.position.z = obj.position.z;
//         localElement.rotation.x = obj.rotation._x;
//         localElement.rotation.y = obj.rotation._y;
//         localElement.rotation.z = obj.rotation._z;
//     } else {
//         // creates and add to scene and objectsToSync
//         duckMesh.objectId = obj.objectId;
//         duckMesh.name = obj.name;
//         duckMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
//         let newObj = duckMesh.clone();
//         // let newObj = initCube(DEFAULT_VALUES.geometryCube, DEFAULT_VALUES.colorRed, new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z), true, draggableObjectsSeller, personalSpace);
//         objectsToSync.set(newObj.objectId, newObj);
//         // newObj.position.set(obj.position.x, obj.position.y, obj.position.z);
//         localScene.add(newObj);
//         // addObjectToDragConrols(newObj);
//     }
    
//     //TOOD maybe tween/interpolate between positions
// }

// function makeVideoMaterial(id) {
//     const videoElement = document.getElementById(id);
//     const videoTexture = new THREE.VideoTexture(videoElement);

//     return new THREE.MeshBasicMaterial({
//         map: videoTexture,
//         overdraw: true,
//         side: THREE.DoubleSide,
//     });

//   }

// function render() {
//     renderer.render( localScene, localCamera );
// }

