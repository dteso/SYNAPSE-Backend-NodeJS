const { DeviceService } = require('../services/device.service');
const { NotificationsService } = require('../services/notifications.service');
const Notification = require('../dal/models/notification.model');
const { MIN_LEVEL_REACHED_NOTIFICATION, REFILLED_NOTIFICATION } = require('../services/helpers/notifications.const');

class SocketService {

    currentRooms = [];
    deviceService = new DeviceService();

    constructor() {
        this.currentRooms = [];
    }

    /**
     * Retransmite un mensaje a todos los dispositivos conectados al server
     * 
     * @param {*} wss 
     * @param {*} data 
     */
    broadcast(wss, data) {
        wss.clients?.forEach(function each(ws) {
            ws.send(data);
        });
    }

    /**
     * Retransmite una nueva conexión y muestra el número de clientes actuales
     * @param {*} wss 
     */
    checkNewClient(wss) {
        console.log("NEW CONNECTION - Usuarios conectados: " + wss.clients.size);
        this.broadcast(`{"event": "USER_COMMAND", "data": "PENNY"}`);
        console.log('-----------------');
    }


    /**
     * Valida que el paquete de datos proceda de una fuente autorizada
     * 
     * @param {*} jsonData 
     * @param {*} ws 
     */
    async validateConnection(jsonData, ws) {
        // console.log('JSON DATA: ', jsonData);
        let isValid = false;

        console.log("···········································");
        if (this.roomForDeviceNotExists(jsonData)) {
            isValid = await this.createRommIfIsAuthorized(jsonData, ws);
        } else {
            let existentRoom = this.getExistentRoom(jsonData);
            if (existentRoom !== undefined && jsonData.data.deviceType === 'APP') {
                this.updateTargetRoomWithApp(existentRoom, jsonData, ws);
                isValid = true;
            } else if (existentRoom !== undefined && jsonData.data.deviceType === 'DEV') {
                if (this.deviceNotIncludedIn(existentRoom, jsonData)) { // Comprobar si existe en BD por MAC y appKey
                    isValid = await this.addDeviceIfAuthorized(jsonData, existentRoom, ws);
                } else { // Ya está incluído
                    await this.updateDeviceStatus(jsonData, existentRoom, ws);
                    isValid = true;
                }
            }
            console.log("VERIFICACION REALIZADA");
            console.log("Current rooms: ", this.currentRooms);
            console.log("···········································\n");
        }
        return isValid;
    }


    async updateDeviceStatus(jsonData, existentRoom, ws) {
        console.log("Actualizando estado del dispositivo ", jsonData.data.MAC);

        const deviceByFilter = existentRoom.devices.filter(dev => dev.MAC === jsonData.data.MAC);
        const targetDevice = deviceByFilter[0]; // La MAC debe ser única sólo debe resultar uno del filtro

        if (targetDevice !== null && targetDevice !== undefined) {
            targetDevice.ws = ws;
            targetDevice.name = jsonData.data.name; // Por si se ha cambiado el nombre del dispositivo
        }

        if (targetDevice.minLevelReached !== jsonData.data.minLevelReached) { // Si cambia
            const dbDevices = await this.deviceService.getDeviceByMacAndAppKey(jsonData.data.MAC, jsonData.data.appKey);

            const dbUser = dbDevices[0].user;
            targetDevice.minLevelReached = jsonData.data.minLevelReached;
            console.log('Notificar a....', dbUser.notificationId);

            if (jsonData.data.minLevelReached === 'YES') {
                await this.processEvent(jsonData, MIN_LEVEL_REACHED_NOTIFICATION(dbUser.notificationId, dbDevices[0].name));
            }
            if (jsonData.data.minLevelReached === 'NO') {
                await this.processEvent(jsonData, REFILLED_NOTIFICATION(dbUser.notificationId, dbDevices[0].name));
            }
        }

        // Siempre que se reciba estado de un dispositivo, este se almacena
        await this.deviceService.updateDeviceStatus(jsonData.data.MAC, jsonData.data.appKey, jsonData.data.minLevelReached, jsonData.data.name);
    }

    /**
     * Gestiona el guardado en BD y notificación por cada cambio de estado
     * 
     * @param {*} jsonData 
     * @param {*} notificationObj 
     */
    async processEvent(jsonData, notificationObj) {
        const notification = new Notification(notificationObj);
        const notificationsService = new NotificationsService();
        return await notificationsService.createAndNotify(jsonData.data.appKey, jsonData.data.MAC, notification);
    }


    /**
     * Añade dipositivo a sala existente comprobando autorización previamente
     * 
     * @param {*} jsonData 
     * @param {*} existentRoom 
     * @param {*} ws 
     */
    async addDeviceIfAuthorized(jsonData, existentRoom, ws) {
        console.log("···········································");

        if (await this.isRegistered(jsonData)) {
            console.log("IDENTIFICACIÓN CORRECTA: Autorizado");
            this.addDeviceToExistentRoom(existentRoom, ws, jsonData);
        } else {
            console.log("PELIGRO: DISPOSITIVO NO AUTORIZADO!!!");
            ws.close();
        }
    }


    /**
     * Incluye una conexión desde app a su sala correspondiente
     * 
     * @param {*} existentRoom 
     * @param {*} jsonData 
     * @param {*} ws 
     */
    updateTargetRoomWithApp(existentRoom, jsonData, ws) {
        if (this.appNotIncludedIn(existentRoom, jsonData) && jsonData.data.appKey != undefined) {
            this.addAppToExixtentRoom(existentRoom, ws, jsonData); // Si es otro usuario se considera una conexión distinta
        } else {
            existentRoom.apps.filter(app => app.user === jsonData.data.user)[0].ws = ws;
        }
    }

    /**
     * Crea una sala verificando autorización pevia
     * 
     * @param {*} jsonData 
     * @param {*} ws 
     * @returns 
     */
    async createRommIfIsAuthorized(jsonData, ws) {
        if (await this.isRegistered(jsonData)) {
            console.log("IDENTIFICACIÓN CORRECTA: Autorizado. Se creará nueva sala");
            this.createRoom(jsonData, ws);
            return true;
        }
        console.log("PELIGRO: DISPOSITIVO NO AUTORIZADO!!!. No se creará la sala.");
        ws.close();
        return false;
    }


    roomForDeviceNotExists(jsonData) {
        return jsonData.data.appKey !== undefined && jsonData.data.appKey !== ' ' && this.currentRooms.filter(room => room.appKey === jsonData.data.appKey)[0] === undefined;
    }

    /**
     * Crea una nueva sala
     * 
     * @param {*} jsonData 
     * @param {*} ws 
     * @returns 
     */
    async createRoom(jsonData, ws) {
        if (!await this.isRegistered(jsonData)) {
            console.log("DISPOSITIVO NO REGISTRADO!!!!");
            return;
        } else {
            console.log("IDENTIFICACIÓN CORRECTA: Autorizado");

            console.log("... CREATING ROOM ...");
            let newRoom = {
                appKey: jsonData.data.appKey,
                devices: [],
                apps: [],
            };

            if (jsonData.data.deviceType === 'APP') {
                newRoom.apps.push({
                    ws: ws,
                    deviceType: 'APP',
                    user: jsonData.data.user,
                });
            } else if (jsonData.data.deviceType === 'DEV') {
                newRoom.devices.push({
                    ws: ws,
                    deviceType: 'DEV',
                    MAC: jsonData.data.MAC,
                    minLevelReached: jsonData.data.minLevelReached,
                    name: jsonData.data.name
                });
            }

            console.log("New room: ", newRoom);

            this.currentRooms.push(newRoom);

            console.log("VERIFICACION REALIZADA");
            console.log("Current rooms: ", this.currentRooms);
            console.log("···········································\n");
        }
    }

    /**
     * Comprueba si ya hay una habitación existente para la conexión recibida
     * 
     * @param {*} jsonData 
     * @returns 
     */
    getExistentRoom(jsonData) {
        return this.currentRooms.filter(room => room.appKey === jsonData.data.appKey)[0];
    }

    /**
     * devuelve un bolleano indicando si una app cliente ya se encuentra en alguna sala
     * 
     * @param {*} existentRoom 
     * @param {*} jsonData 
     * @returns 
     */
    appNotIncludedIn(existentRoom, jsonData) {
        return existentRoom.apps.filter(app => app.user === jsonData.data.user)[0] === undefined;
    }

    /**
     * Añade un cliente applicación a la sala correspondiente
     * 
     * @param {*} existentRoom 
     * @param {*} ws 
     * @param {*} jsonData 
     */
    addAppToExixtentRoom(existentRoom, ws, jsonData) {
        console.log("···········································");
        console.log("... ADDING APP TO ROOM  ...", existentRoom.appKey);
        console.log("···········································\n");
        existentRoom.apps.push(
            {
                ws: ws,
                deviceType: "APP",
                user: jsonData.data.user
            }
        );
    }

    /**
     * Devuelve un booleano indicando si el dispositivo ya se encuentra en alguna de las salas
     * 
     * @param {*} existentRoom 
     * @param {*} jsonData 
     * @returns 
     */
    deviceNotIncludedIn(existentRoom, jsonData) {
        const result = existentRoom.devices.filter(dev => dev.MAC === jsonData.data.MAC)[0] === undefined;
        console.log('DeviceNotIncludedIn: ', result);
        return result;
    }

    /**
     * Añade un dispositivo a una sala existente
     * 
     * @param {*} existentRoom 
     * @param {*} ws 
     * @param {*} jsonData 
     */
    addDeviceToExistentRoom(existentRoom, ws, jsonData) {
        console.log("···········································");
        console.log("... ADDING DEVICES TO ROOM  ...", existentRoom.appKey);
        console.log("···········································\n");
        existentRoom.devices.push(
            {
                ws: ws,
                deviceType: "DEV",
                MAC: jsonData.data.MAC,
                minLevelReached: jsonData.data.minLevelReached,
                name: jsonData.data.name
            }
        );

    }

    /**
     * Visualiza información del paquete retransmitido
     * 
     * @param {*} roomToBroadcast 
     */
    logTargets(roomToBroadcast) {
        console.log("···········································");
        console.log("Room to bradcast: ", roomToBroadcast.appKey);
        console.log('devices: [');
        roomToBroadcast.devices.forEach(device => {
            console.log(`{MAC: ${device.MAC}, minLevelReached: ${device.minLevelReached}, name: ${device.name}},`);
        });
        console.log(']');
        console.log('apps: [');
        roomToBroadcast.apps.forEach(app => {
            console.log(`{user: ${app.user}},`);
        });
        console.log(']');
        console.log("···········································\n");
    }

    /**
     * Filtra e invica la transmisión de datos a los dispositivos de un mismo sistema
     * @param {*} jsonData 
     * @param {*} ws 
     * @param {*} data 
     */
    broadcastByAppKey(jsonData, ws, data) {
        const roomToBroadcast = this.currentRooms.filter(client => client.appKey === jsonData.data.appKey)[0];

        if (roomToBroadcast !== undefined) {

            this.logTargets(roomToBroadcast);

            /* Si queremos notificar también a los dispositivos */
            // roomToBroadcast.devices?.forEach(function each(device) {
            //   device.ws.send(data);
            // });

            roomToBroadcast.devices.forEach(device => {
                device.ws.send(data);
                console.log("mensaje enviado a :", device.name);
            });

            this.broacastToOwnerApp(roomToBroadcast, data);
        }
    }

    /**
     * Retransmite datos a una app concreta
     * @param {*} roomToBroadcast 
     * @param {*} data 
     */
    broacastToOwnerApp(roomToBroadcast, data) {
        roomToBroadcast.apps?.forEach(app => {
            console.log("···········································");
            console.log("Sending message to user <" + app.user + ">");
            console.log("···········································\n");
            app.ws.send(data);

        });
    }

    /**
     * Comprueba que el cliente se encuentre registrado en el sistema para admitir sus mensajes
     * @param {*} jsonData 
     * @returns 
     */
    async isRegistered(jsonData) {

        if (jsonData.data.deviceType === 'DEV') {
            const dbDevices = await this.deviceService.getDeviceByMacAndAppKey(jsonData.data.MAC, jsonData.data.appKey);

            console.log("···········································");
            console.log(`Dispositivo ${jsonData.data.name || jsonData.data.user} : ESTADO REGISTRO ::::> `, dbDevices !== null && dbDevices !== undefined && dbDevices.length > 0 ? 'OK' : 'KO');
            console.log("···········································\n");

            return dbDevices !== null && dbDevices !== undefined && dbDevices.length > 0;
        } else {
            return true; // TODO: Hace comprobación que el usuario aportado se encuentre en BD
        }

    }


}

module.exports = {
    SocketService
}
