import * as THREE from 'three';

export default class AudioManager {
    constructor(localCamera) {

        this.listener = new THREE.AudioListener();
        localCamera.add( this.listener );

        this.audioLoader = new THREE.AudioLoader();

        this.winSound = new THREE.Audio( this.listener );
        this.audioLoader.load( './assets/sounds/welldone.ogg', ( buffer ) => {
            this.winSound.setBuffer( buffer );
            this.winSound.setLoop( false );
            this.winSound.setVolume( 0.5 );
        });

        this.gameStartSound = new THREE.Audio( this.listener );
        this.audioLoader.load( './assets/sounds/palimpalim1.wav', ( buffer ) => {
            this.gameStartSound.setBuffer( buffer );
            this.gameStartSound.setLoop( false );
            this.gameStartSound.setVolume( 0.5 );
        });

        this.completeTaskSound = new THREE.Audio( this.listener );
        this.audioLoader.load( './assets/sounds/completetask.wav', ( buffer ) => {
            this.completeTaskSound.setBuffer( buffer );
            this.completeTaskSound.setLoop( false );
            this.completeTaskSound.setVolume( 0.5 );
        });
    }

    playWinSound = () => {
        this.winSound.play();
    };

    playPalimSound = () => {
        this.gameStartSound.play();
    };

    playCompleteTaskSound = () => {
        if (this.completeTaskSound.isPlaying) {
            this.completeTaskSound.stop();
            this.completeTaskSound.play();
        } else {
            this.completeTaskSound.play();
        }
    };
}
