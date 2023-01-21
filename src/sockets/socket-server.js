
/*
 * -------- websocket io connection---------*/

const { SocketService } = require('./socket-service');
require('dotenv').config();
const { log, logDanger, logInfo, logWarning, logSuccess, logSuccessBg } = require('../services/helpers/logger')
/**
 * 
 *    W E B    S O C K E T S 
 * 
 */

startSockets = async (server) => {

  const socketService = new SocketService();

  socketService.currentRooms = await socketService.buildInitialRooms();
  displayInitialRooms(socketService);

  const WebSocketServer = require('ws').Server;
  const wss = new WebSocketServer({ port: process.env.WS_PORT });
  logWarning("WS_RUNNING] Sockets Server corriendo en el puerto " + process.env.WS_PORT)

  wss.on('connection', function connection(ws, req) {

    ws.on('message', async function message(data) {
      const jsonData = JSON.parse(data);
      logSuccessBg('[WS_MSG_RECEIVED] FROM : [' + jsonData.data.name + ']=>' + JSON.stringify(jsonData, null, 2));
      const isValid = await socketService.manageConnection(jsonData, ws);
      if (isValid && ((jsonData.event === 'MESSAGE' || jsonData.event === 'CONNECTION') && jsonData.data.appKey) || jsonData.event === 'USER_COMMAND') {
        socketService.broadcastByAppKey(jsonData, ws, `${data}`);
      }
    });

    ws.on('close', function close(data) {
      logDanger('[WS_CONNECTION_CLOSED] A connection was closed. logged users', wss.clients.size);
      socketService.broadcast(wss, `{"event": "CONNECTION", "data": "user disconnected", "logged-users":${wss.clients.size}}`);
    });

    socketService.checkNewClient(wss);
  });

  wss.on('close', function close() {
    logDanger('[WS_CONNECTION_CLOSED] Web Server Closed');
  });
}

module.exports = {
  startSockets
}






function displayInitialRooms(socketService) {
  const displayRooms = JSON.parse(JSON.stringify(socketService.currentRooms));
  displayRooms.forEach(room => {
    room.devices = room.devices.map(device => `${device.MAC} - ${device.name}`);
    room.apps = room.apps.map(app => `${app.user}`);
  });
  logWarning('Initial rooms:', JSON.stringify(displayRooms, null, 2));
}
/**
 * [{
 *  "ws": ws,
 *  "appKey": appKey,
 *  "deviceType" "APP" // ó DEV :
 *  "MAC": 12:34:56:78:90:AA
 * }]
 */

// [{
//   appKey: "",
//   devices: [
//     {
//        ws: ws,
//        appKey: "",
//        deviceType: "DEV",
//        MAC: "12:34:56:78:90:AA"
//     }
//   ],
//   apps:[
//     {
//        ws: ws,
//        appKey: "",
//        deviceType: "DEV",
//        user: "d_teso"
//     }
//   ],
// }]























