import {appManager} from './app';

export default class MenuManager {
    startMenu() {
        document.getElementById('roomNameButton').addEventListener('click', () => {
            appManager.initVideoChat(document.getElementById('roomName').value);
        
            document.getElementById('roomNameSection').classList.add = 'deactivated';
        
            let waitingToOtherRoomMates = document.createElement("p");
            waitingToOtherRoomMates.innerHTML = 'Auf andere Raum-Teilnehmer warten...';
        
            document.getElementById('welcomeScreen').append(waitingToOtherRoomMates);
        });
    }
}