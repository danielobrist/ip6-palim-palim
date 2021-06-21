import * as THREE from 'three';
import { GameController } from '../game/gameController';

export default class InteractionManager {
    constructor(renderer, camera, domElement, isSeller) {
        this.renderer = renderer;
        this.camera = camera;
        this.domElement = domElement;
        this.gameController = GameController();

        this.draggableObjects = [];
        this.selectedObject;

        this.raycaster = new THREE.Raycaster();
        this.intersection = new THREE.Vector3();

        this.domElement.addEventListener('pointerdown', this.onPointerDown);
        this.domElement.addEventListener('pointermove', this.onPointerMove);
        this.domElement.addEventListener('pointerup', this.onPointerUp);
        this.mouse = new THREE.Vector2();

        this.interactionPlane = new THREE.Plane();

        if (isSeller){
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,-3));
        } else {
            this.interactionPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.interactionPlane.normal), new THREE.Vector3(0,0,3));
        }
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
        console.log(this.selectedObject);

    }

    onPointerUp = (event) => {
        console.log('Pointer up event');
        this.selectedObject = null;
        
    }

    onPointerMove = (event) => {
        if (!this.selectedObject) { return }

        this.getMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.ray.intersectPlane(this.interactionPlane, this.intersection); //saves intersection point into this.intersection
        this.selectedObject.object.position.copy(this.intersection); //moves selectedObject to the position where the ray intersected the interactionPlane

        // console.log(this.selectedObject.object.position.z);
        this.gameController.sendGameobjectUpdate(this.selectedObject.object);
        
        //TODO
        // handle offset

        //TODO 
        // gameController.sendGameobjectUpdate(getObjJSON(event.object));
        // render();

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
