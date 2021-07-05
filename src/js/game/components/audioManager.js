import * as THREE from 'three';

export default class AudioManager {
    constructor(localCamera) {
        // create an AudioListener and add it to the camera
        this.listener = new THREE.AudioListener();
        localCamera.add( this.listener );

        // create a global audio source
        this.winSound = new THREE.Audio( this.listener );

        // load a sound and set it as the Audio object's buffer
        this.audioLoader = new THREE.AudioLoader();
        
        this.audioLoader.load( './assets/sounds/welldone.ogg', ( buffer ) => {
            this.winSound.setBuffer( buffer );
            this.winSound.setLoop( false );
            this.winSound.setVolume( 0.5 );
        });
    }

    playWinSound() {
        this.winSound.play();
    }
}