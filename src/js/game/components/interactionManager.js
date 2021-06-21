import * as THREE from 'three';
import { GameSync } from './gameSync';

export default class InteractionManager {
    constructor(renderer, camera, isSeller) {
        this.renderer = renderer;
        this.camera = camera;
        this.domElement = renderer.domElement;
        this.gameSync = GameSync();

        this.selectedObject;
        this.draggableObjects = [];
        this.itemSink; //basket

        this.raycaster = new THREE.Raycaster();
        this.intersection = new THREE.Vector3();

        this.domElement.addEventListener('pointerdown', this.onPointerDown);
        this.domElement.addEventListener('pointermove', this.onPointerMove);
        this.domElement.addEventListener('pointerup', this.onPointerUp);
        this.mouse = new THREE.Vector2();

        this.setupInteractionPlane(isSeller);
        this.setupItemSink();
        
    }

    setupInteractionPlane(isSeller) {
        this.interactionPlane = new THREE.Plane();
        if (isSeller){
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,-3));
        } else {
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,3));
        }
    }

    setupItemSink() {
        this.itemSink = new THREE.Box3;
        // TODO this.itemSink.setFromObject with basket object instead
        this.itemSink.setFromCenterAndSize(new THREE.Vector3(0,0,-2.5), new THREE.Vector3(1,1,1))
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

        this.raycaster.ray.intersectPlane(this.interactionPlane, this.intersection); //saves intersection point into this.intersection
        this.selectedObject.object.position.copy(this.intersection);

        console.log(this.selectedObject);
    }

    onPointerUp = (event) => {
        console.log('Pointer up event');
        // TODO check if selectedObject is over itemSink/basket
        this.getMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if(this.raycaster.ray.intersectsBox(this.itemSink)) {
            console.log('Item put in basket!');
            // TODO remove from scene, put into basket (where?) and update item count in game state somehow
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
    
}
