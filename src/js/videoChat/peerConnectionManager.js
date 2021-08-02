import VideoChat from "./videoChat";


export default class PeerConnectionManager {
    constructor() {
        //RoomManager

        //VideoChatManager

        //DataChannelManager
    }

    joinRoom(roomNumber) {
        console.log("JOINING ROOM " + roomNumber);
        new VideoChat(roomNumber);
        //TODO RoomManager join Room 
    }
}