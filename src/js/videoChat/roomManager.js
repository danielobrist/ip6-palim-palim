import * as THREE from 'three';

export default class RoomManager extends THREE.EventDispatcher {

    isInitiator;
    isRoomReady;
    currentRoom;

    constructor() {
        super();
        this.socket = io.connect();

        this.socket.on('created', (room) => {
            console.log('Created room ' + room);
            this.currentRoom = room;
            this.isInitiator = true;
        });

        this.socket.on('full', (room) => {
            //TODO show user that room is full.
            console.log('Room ' + room + ' is full');
        });

        this.socket.on('join', (room) => {
            console.log('Another peer made a request to join room ' + room);
            console.log('This peer is the initiator of room ' + room + '!');
            this.isRoomReady = true;

            this.dispatchEvent( { type: 'peerJoined', room: room } );
        });

        this.socket.on('joined', (room) => {
            console.log('joined: ' + room);
            this.isRoomReady = true;
            this.currentRoom = room;
            document.getElementById('waitingToOtherRoomMates').classList.add('deactivated');
        });

        this.socket.on('log', (array) => {
            console.log.apply(console, array);
        });

        this.socket.on('message', (message) => {
            console.log('Client received message:', message);
            this.dispatchEvent( { type: 'serverMessage', message: message } );
        });
    }

    sendSignalingMessage = (message) => {
        console.log('Client sending message: ', message);
        console.log('Current room: ' + this.currentRoom);
        this.socket.emit('message', this.currentRoom, message); 
    };

    joinRoom = (roomName) => {
        if (roomName !== '') {
            this.socket.emit('create or join', roomName);
            console.log('Attempted to create or join room', roomName);
        } else {
            // TODO show user that input is invalid
        }
    }
}
