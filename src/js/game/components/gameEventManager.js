import * as THREE from 'three';
import { Box3, Vector3 } from 'three';
import { GameSync } from './gameSync';

export default class GameEventManager extends THREE.EventDispatcher {
    constructor(renderer, camera, isSeller, shoppingBasketMesh) {
        super();

        this.renderer = renderer;
        this.camera = camera;
        this.domElement = renderer.domElement;
        this.gameSync = GameSync();

        this.selectedObject;
        this.selectedObjectPlaceholder;
        this.dragStartPoint = new Vector3();
        this.draggableObjects = [];
        this.shoppingBasket;
        this.shoppingBasketMesh = shoppingBasketMesh;
        this.selectionSpace;
        this.dispensers = [];

        this.raycaster = new THREE.Raycaster();
        this.intersection = new THREE.Vector3();

        this.domElement.addEventListener('pointerdown', this.onPointerDown);
        this.domElement.addEventListener('pointermove', this.onPointerMove);
        this.domElement.addEventListener('pointerup', this.onPointerUp);
        this.mouse = new THREE.Vector2();

        this.setupInteractionPlane(isSeller);
        this.setupBasketSpace();
        this.setupSelectionSpace();
    }

    setupInteractionPlane(isSeller) {
        this.interactionPlane = new THREE.Plane();
        if (isSeller){
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,-3));
        } else {
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,3));
        }
    }

    setupBasketSpace() {
        this.shoppingBasket = new THREE.Box3;

        this.shoppingBasket.setFromObject(this.shoppingBasketMesh);

        // this.shoppingBasket.setFromCenterAndSize(new THREE.Vector3(0,0,-2.5), new THREE.Vector3(1,1,1));
    }

    setupSelectionSpace() {
        this.selectionSpace = new THREE.Box3;
        this.selectionSpace.setFromCenterAndSize(new THREE.Vector3(0,0,2.5), new THREE.Vector3(7,1,1));
    }

    // deprecated
    setupDispensers() {
        this.draggableObjects.forEach((item) => {
            let dispenser = new THREE.Box3();
            dispenser.setFromObject(item);
            this.dispensers.push(dispenser);
        });
    }

    addDraggableObject(obj) {
        this.draggableObjects.push(obj);
    }

    setDraggableObjects(objs) {
        this.draggableObjects = objs;
    }

    select(obj) {
        this.selectedObject = obj;
    }

    deselect() {
        this.selectedObject = null;
    }

    update() {

    }

    onPointerDown = (event) => {
        console.log('Pointer down event');

        this.getMousePosition(event);
        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersects = this.raycaster.intersectObjects(this.draggableObjects);
        this.selectedObject = intersects[0];
        if (intersects.length > 0){
            this.dragStartPoint.copy(intersects[0].object.position);
            if (this.raycaster.ray.intersectsBox(this.selectionSpace)) {
                // TODO add a placeholder clone to the scene with opacity at startPosition but dont add it to draggableObjects
                this.dispatchEvent( { type: 'itemRemove', item: this.selectedObject.object } );
            }
        }

        this.raycaster.ray.intersectPlane(this.interactionPlane, this.intersection); //saves intersection point into this.intersection
        if (this.selectedObject) {
            this.selectedObject.object.position.copy(this.intersection);
            this.gameSync.sendGameobjectUpdate(this.selectedObject.object);
            console.log(this.selectedObject);
        }
    }

    onPointerUp = (event) => {
        console.log('Pointer up event');
        this.getMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.raycaster.ray.intersectsBox(this.selectionSpace) && this.selectedObject) {
            // TODO remove the placeholder from the scene
            this.selectedObject.object.position.copy(this.selectedObject.object.startPosition);
            this.gameSync.sendGameobjectUpdate(this.selectedObject.object);
        } else if (!this.raycaster.ray.intersectsBox(this.selectionSpace)) {
            // TODO up the opacity of the placeholder and add it to draggableObjects

        }
        // TODO check if this.selectedObject is intersecting this.itemSink instead! (interactionPlane needs to intersect with itemsink for this to work!)
        if(this.raycaster.ray.intersectsBox(this.shoppingBasket)) {

            this.selectedObject.object.geometry.computeBoundingBox();
            this.selectedObject.object.updateMatrixWorld();
            var box1 = this.selectedObject.object.geometry.boundingBox.clone();
            box1.applyMatrix4(this.selectedObject.object.matrixWorld);

            if (box1.intersectsBox(this.shoppingBasket)){
                console.log(this.selectedObject.object.name + ' put in basket!');
                this.dispatchEvent( { type: 'basketAdd', item: this.selectedObject.object } );
                this.sendRemoveFromScene(this.selectedObject.object.name);
            }

        }

        // finally
        this.selectedObject = null;
    }

    onPointerMove = (event) => {
        if (!this.selectedObject) { return }

        this.getMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        this.raycaster.ray.intersectPlane(this.interactionPlane, this.intersection); //saves intersection point into this.intersection
        this.selectedObject.object.position.copy(this.intersection); //moves selectedObject to the position where the ray intersected the interactionPlane

        // console.log(this.selectedObject.object.position.z);
        this.gameSync.sendGameobjectUpdate(this.selectedObject.object);
        
        //TODO
        // handle offset?
    }

    getMousePosition = (event) => {
        //TODO test this (alternative from DragControls) 
        // const rect = _domElement.getBoundingClientRect();
        // _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		// _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
        // 

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    sendGameOver() {
        this.gameSync.sendGameEventMessage('gameOver', null);
    }

    sendGoToGameModeSelection() {
        this.gameSync.sendGameEventMessage('gameModeSelection', null);
    }
    
    sendRemoveFromScene(itemName) {
        this.gameSync.sendGameEventMessage('remove', itemName);
    }

}
