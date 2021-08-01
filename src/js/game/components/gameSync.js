export {GameSync};

import {dataChannel, dataChannel2} from '../../videoChat/videoChat';

const GameSync = () => {

    function addLocalObject(obj) {

        console.log("localObject added for game sync: " + JSON.stringify(obj) + " id: " + obj.id)
        let customObject = {uuid: obj.uuid, position: obj.position, rotation: obj.rotation};
        let json = JSON.stringify(customObject);
        localObjects.push(json);

        // localObjectsMap.set(obj.id, json);

    }

    // sends a single object right now, used when dragging
    function sendGameobjectUpdate(obj) {
        if (dataChannel && typeof obj !== 'undefined' && dataChannel.readyState === "open") {
            dataChannel.send(getObjJSON(obj));
        }
    }


    function updateRemoteObjects(data) {
        let obj = JSON.parse(data);
        // console.log('Parsed JSON uuid: ' + obj.uuid + ', positionx: ' + obj.position.x + ', rotationx: ' + obj.rotation._x);
    
        //TODO update only specific object!
        let localElement = getLocalObject
        cube.position.x = obj.position.x;
        cube.position.y = obj.position.y;
        cube.position.z = obj.position.z;
        cube.rotation.x = obj.rotation._x;
        cube.rotation.y = obj.rotation._y;
        cube.rotation.z = obj.rotation._z;
    
        //TOOD maybe tween/interpolate between positions
    
    }

    const getObjJSON = (object) => {
        let obj = {name: object.name, position: object.position, rotation: object.rotation, typeId: object.typeId, objectId: object.objectId};
        let json = JSON.stringify(obj);
        return json;
    }

    // old
    function sendGameOver() {
        dataChannel2.send('gameOver');
    }

    // new, use this
    const sendGameEventMessage = (message, item) => {
        console.log("SENDING GAME EVENT MESSAGE:");

        let msg = {
            message: message,
            item: item
        };
        let json = JSON.stringify(msg);
        console.log(json);

        dataChannel2.send(
            json
        );
    }

    return {
        addLocalObject,
        sendGameobjectUpdate,
        updateRemoteObjects,
        getObjJSON,
        sendGameOver,
        sendGameEventMessage
    }

}
