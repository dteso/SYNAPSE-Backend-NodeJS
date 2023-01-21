const { DeviceService } = require('../services/device.service');
const { NotificationsService } = require('../services/notifications.service');
const Notification = require('../dal/models/notification.model');
const { MIN_LEVEL_REACHED_NOTIFICATION, REFILLED_NOTIFICATION } = require('../services/helpers/notifications.const');
const deviceModel = require('../dal/models/device.model');
let currentRooms = require('../services/storage.service');

const { log, logInfo, logWarning, logSuccess, logDanger, logSuccessBg } = require('../services/helpers/logger')
class SocketService {

    //currentRooms = [];
    deviceService = new DeviceService();

    constructor() { }

    /**
     * Retransmite un mensaje a todos los dispositivos conectados al server
     * 
     * @param {*} wss 
     * @param {*} data 
     */
    async broadcast(wss, data) {
        wss.clients?.forEach(function each(ws) {
            ws.send(data);
        });
    }

    /**
     * Retransmite una nueva conexión y muestra el número de clientes actuales
     * @param {*} wss 
     */
    async checkNewClient(wss) {
        logInfo("NEW CONNECTION - Usuarios conectados: " + wss.clients.size);
        //this.broadcast(`{"event": "USER_COMMAND", "data": "PENNY"}`); // TODO: Quitar
    }


    /**
     * Valida que el paquete de datos proceda de una fuente autorizada
     * 
     * @param {*} jsonData 
     * @param {*} ws 
     */
    async manageConnection(jsonData, ws) {

        try {
            let isValid = false;

            if (await this.roomForDeviceNotExists(jsonData)) {
                isValid = await this.createRommIfIsAuthorized(jsonData, ws);
            } else if (jsonData.event !== 'USER_COMMAND') {
                let existentRoom = await this.getExistentRoom(jsonData);
                if (await this.roomAlreadyExistsAndIsAppConnection(existentRoom, jsonData)) {
                    await this.updateTargetRoomWithApp(existentRoom, jsonData, ws);
                    isValid = true;
                } else if (this.roomAlreadyExistsAndIsDeviceConnection(existentRoom, jsonData) && jsonData.event !== 'USER_COMMAND') {
                    if (await this.deviceNotIncludedIn(existentRoom, jsonData)) { // Comprobar si existe en BD por MAC y appKey
                        isValid = await this.addDeviceIfAuthorized(jsonData, existentRoom, ws);
                    } else { // Ya está incluído
                        await this.updateDeviceStatus(jsonData, existentRoom, ws);
                        isValid = true;
                    }
                }
                logInfo("VERIFICACION REALIZADA PARA [" + jsonData.data.name + "] : " + jsonData.data.MAC + "");
                if (currentRooms === undefined) {
                    logDanger(`Current Rooms does nos exist. You are: ` + jsonData);
                    return isValid;
                }
                // const displayRooms = JSON.parse(JSON.stringify(currentRooms));
                // displayRooms.forEach(room => {
                //     room.devices = room.devices.map(device => `${device.MAC} - ${device.name}`);
                //     room.apps = room.apps.map(app => `${app.user}`);
                // })
                // logWarning("Current rooms: ", JSON.stringify(displayRooms, null, 2));
                this.displayInitialRooms();
            }
            return isValid;
        } catch (e) {
            logDanger(`Current Rooms does nos exist. You are: ${JSON.stringify(jsonData)} - ERROR: ${e}`);
            return false;
        }

    }


    async roomAlreadyExistsAndIsDeviceConnection(existentRoom, jsonData) {
        return existentRoom !== undefined && jsonData.data.deviceType === 'DEV' && jsonData.event === 'MESSAGE';
    }

    async roomAlreadyExistsAndIsAppConnection(existentRoom, jsonData) {
        return existentRoom !== undefined && jsonData.data.deviceType === 'APP' && jsonData.event === 'CONNECTION';
    }

    async updateDeviceStatus(jsonData, existentRoom, ws) {
        logInfo("Actualizando estado del dispositivo ", jsonData.data.MAC);

        const deviceByFilter = existentRoom.devices.filter(dev => dev.MAC === jsonData.data.MAC);
        const targetDevice = deviceByFilter[0]; // La MAC debe ser única sólo debe resultar uno del filtro

        await this.updateDeviceWs(targetDevice, ws, jsonData);
        await this.manageDeviceChanges(targetDevice, jsonData);
        // Siempre que se reciba estado de un dispositivo, este se almacena en BD
        await this.deviceService.updateDeviceStatus(jsonData.data.MAC, jsonData.data.appKey, jsonData.data.minLevelReached, jsonData.data.name);
    }

    /**
     * Actualiza el websocket del objeto device
     * @param {*} targetDevice 
     * @param {*} ws 
     * @param {*} jsonData 
     */
    async updateDeviceWs(targetDevice, ws, jsonData) {
        if (targetDevice !== null && targetDevice !== undefined) {
            targetDevice.ws = ws;
            targetDevice.name = jsonData.data.name;
            targetDevice.mode = jsonData.data.mode;
        }
    }

    /**
     * Gestiona los cambios a realizar y las acciones derivadas de ellos como puede ser notificar en determinadas condiciones
     * @param {*} targetDevice 
     * @param {*} jsonData 
     */
    async manageDeviceChanges(targetDevice, jsonData) {
        console.log('Is first Load', targetDevice.firstLoad);
        if (targetDevice.minLevelReached !== jsonData.data.minLevelReached && !targetDevice.firstLoad) { // Si cambia
            const dbDevices = await this.deviceService.getDeviceByMacAndAppKey(jsonData.data.MAC, jsonData.data.appKey);

            if (dbDevices[0]) {
                const dbUser = dbDevices[0].user;
                if (jsonData.data.minLevelReached !== "") {
                    targetDevice.minLevelReached = jsonData.data.minLevelReached;
                }
                if (jsonData.data.minLevelReached === 'YES') {
                    await this.processEvent(jsonData, MIN_LEVEL_REACHED_NOTIFICATION(dbUser.notificationId, dbDevices[0].name));
                }
                if (jsonData.data.minLevelReached === 'NO') {
                    await this.processEvent(jsonData, REFILLED_NOTIFICATION(dbUser.notificationId, dbDevices[0].name));
                }
                logNotification('Notificar a....', dbUser.email);
            }

        } else {
            targetDevice.firstLoad = false;
            targetDevice.minLevelReached = jsonData.data.minLevelReached;
        }
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

        const deviceMode = jsonData.data.mode;

        if (deviceMode === 'Q') {
            return;
        }
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
        if (await this.isRegistered(jsonData)) {
            logSuccess("IDENTIFICACIÓN CORRECTA: [" + jsonData.data.name + "] AUTORIZADO");
            await this.addDeviceToExistentRoom(existentRoom, ws, jsonData);
        } else {
            logDanger("PELIGRO: DISPOSITIVO NO AUTORIZADO!!!");
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
    async updateTargetRoomWithApp(existentRoom, jsonData, ws) {
        if (this.appNotIncludedIn(existentRoom, jsonData) && jsonData.data.appKey != undefined) {
            await this.addAppToExixtentRoom(existentRoom, ws, jsonData); // Si es otro usuario se considera una conexión distinta
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
            logSuccess("IDENTIFICACIÓN CORRECTA: Autorizado. Se creará nueva sala");
            await this.createRoom(jsonData, ws);
            return true;
        }
        logDanger("PELIGRO: DISPOSITIVO NO AUTORIZADO!!!. No se creará la sala.");
        ws.close();
        return false;
    }


    async roomForDeviceNotExists(jsonData) {
        return jsonData.data.appKey !== undefined && jsonData.data.appKey !== '' && jsonData.data.appKey !== ' ' && !currentRooms.filter(room => room.appKey === jsonData.data.appKey).length;
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
            logDanger("DISPOSITIVO NO REGISTRADO!!!!");
            return;
        } else {
            logSuccess("IDENTIFICACIÓN CORRECTA: Autorizado");
            logInfo("... CREATING ROOM ...");
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
                    name: jsonData.data.name,
                    isFirstLoad: true
                });
            }
            currentRooms.push(newRoom);
            logInfo("New room: ", newRoom);
            logInfo("VERIFICACION REALIZADA");
            const displayRooms = JSON.parse(JSON.stringify(currentRooms));
            displayRooms.forEach(room => {
                room.devices = room.devices.map(device => `${device.MAC} - ${device.name}`);
                room.apps = room.apps.map(app => `${app.user}`);
            })
            // logWarning("Current rooms: ", JSON.stringify(displayRooms, null, 2));
        }
    }

    /**
     * Comprueba si ya hay una habitación existente para la conexión recibida
     * 
     * @param {*} jsonData 
     * @returns 
     */
    async getExistentRoom(jsonData) {
        return currentRooms.filter(room => room.appKey === jsonData.data.appKey)[0];
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
    async addAppToExixtentRoom(existentRoom, ws, jsonData) {
        logInfo("... ADDING APP TO ROOM  ...", existentRoom.appKey);
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
    async deviceNotIncludedIn(existentRoom, jsonData) {
        const result = existentRoom.devices.filter(dev => dev.MAC === jsonData.data.MAC)[0] === undefined;
        logInfo('Dispositivo [' + jsonData.data.MAC + '-' + jsonData.data.name + '] es autorizado: ', !result);
        return result;
    }

    /**
     * Añade un dispositivo a una sala existente
     * 
     * @param {*} existentRoom 
     * @param {*} ws 
     * @param {*} jsonData 
     */
    async addDeviceToExistentRoom(existentRoom, ws, jsonData) {
        logInfo("... ADDING DEVICES TO ROOM  ...", existentRoom.appKey);
        existentRoom.devices.push(
            {
                ws: ws,
                deviceType: "DEV",
                MAC: jsonData.data.MAC,
                minLevelReached: jsonData.data.minLevelReached,
                name: jsonData.data.name,
                mode: jsonData.data.mode
            }
        );
        this.broadcastByAppKey(jsonData);
    }

    /**
     * Visualiza información del paquete retransmitido
     * 
     * @param {*} roomToBroadcast 
     */
    logTargets(roomToBroadcast) {
        console.log("···········································");
        logWarning("Room to bradcast: ", roomToBroadcast.appKey);
        roomToBroadcast.apps.forEach(app => {
            logSuccess(`${app.user}`);
        });
        console.log("···········································\n");
    }

    /**
     * Filtra e invica la transmisión de datos a los dispositivos de un mismo sistema
     * @param {*} jsonData 
     * @param {*} ws 
     * @param {*} data 
     */
    async broadcastByAppKey(jsonData, ws, data) {
        const roomToBroadcast = currentRooms.filter(client => client.appKey === jsonData.data.appKey)[0];

        if (jsonData.event === 'USER_COMMAND' && !jsonData.target) {
            if (roomToBroadcast !== undefined) {
                this.logTargets(roomToBroadcast);

                roomToBroadcast.devices.forEach(device => {
                    if (device.ws !== null && device.ws !== undefined) {
                        device.ws.send(data);
                        logSuccess("Message sent to: ", device.name);
                    } else {
                        logWarning("Not WebSocket assigned yet to: ", device.name);
                    }

                });
                await this.broacastToOwnerApp(roomToBroadcast, data);
            }
        } else {
            if (roomToBroadcast !== undefined)
                await this.broacastToOwnerApp(roomToBroadcast, data);
            // Implementar lógica para atacara a un dispositivo 'target' que se incluya en el jsonData
            // Si no se incluye se envía a todos los dispositivos de una misma appKey
        }
    }

    /**
     * Retransmite datos a una app concreta
     * @param {*} roomToBroadcast 
     * @param {*} data 
     */
    async broacastToOwnerApp(roomToBroadcast, event) {
        roomToBroadcast.apps?.forEach(app => {
            try {
                const eventObj = JSON.parse(event);
                if (eventObj.data && eventObj.data.name) {
                    logSendBg("Sending message from [" + eventObj.data.name + "] to user <" + app.user + ">");
                } else {
                    logSendBg("Sending message to user <" + app.user + ">");
                }
                app.ws.send(event);
            } catch (e) {
                logDanger(`No se ha podido parsear el evento: ${event}`);
            }
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
            logWarning(`Dispositivo ${jsonData.data.name || jsonData.data.user} : ESTADO REGISTRO ::::> `, dbDevices !== null && dbDevices !== undefined && dbDevices.length > 0 ? 'OK' : 'KO');
            return dbDevices !== null && dbDevices !== undefined && dbDevices.length > 0;
        } else {
            return true; // TODO: Hace comprobación que el usuario aportado se encuentre en BD
        }
    }


    async buildInitialRooms() {
        let roomsBuiltFromDb = [];

        logInfo('Building rooms structure...');
        const deviceService = new DeviceService(deviceModel);
        const devices = await deviceService.getEntities();

        let differentAppKeys = new Set(devices.map(entity => entity.appKey));
        currentRooms = roomsBuiltFromDb;
        differentAppKeys.forEach(appKey => {
            const devicesByThisRoomInDb = devices.filter(device => device.appKey === appKey);

            let devicesBySocketRoom = [];
            devicesByThisRoomInDb.forEach(device => {
                devicesBySocketRoom.push({
                    deviceType: "DEV",
                    MAC: device.MAC,
                    minLevelReached: device.minLevelReached,
                    name: device.name,
                    firstLoad: true
                });
            });

            roomsBuiltFromDb.push({
                appKey,
                devices: devicesBySocketRoom,
                apps: []
            });
        });
        this.displayInitialRooms();
        return roomsBuiltFromDb;
    }

    displayInitialRooms() {
        const displayRooms = JSON.parse(JSON.stringify(currentRooms));
        displayRooms.forEach(room => {
            room.devices = room.devices.map(device => `${device.MAC} - ${device.name}`);
            room.apps = room.apps.map(app => `${app.user}`);
        });
        logWarning('Initial rooms:', JSON.stringify(displayRooms, null, 2));
    }
}

module.exports = {
    SocketService
}
