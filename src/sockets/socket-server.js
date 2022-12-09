
/*
 * -------- websocket io connection---------*/

const { SocketService } = require('./socket-service');

/**
 * 
 *    W E B    S O C K E T S 
 * 
 */

startSockets = (server) => {

  const WebSocketServer = require('ws').Server;
  const socketService = new SocketService();
  const wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', function connection(ws, req) {

    ws.on('message', async function message(data) {
      console.log('----------------------------------------------------------');
      console.log('--- RECEIVED %s FROM : %s', req.socket.remoteAddress, data);
      console.log('----------------------------------------------------------');
      const jsonData = JSON.parse(data);
      const isValid = await socketService.validateConnection(jsonData, ws);
      if (isValid && ((jsonData.event === 'MESSAGE' || jsonData.event === 'CONNECTION') && jsonData.data.appKey) || jsonData.event === 'USER_COMMAND') {
        socketService.broadcastByAppKey(jsonData, ws, `${data}`);
      }
    });

    ws.on('close', function close(data) {
      console.log('Usuario Desconectado', data);
      socketService.broadcast(wss, `{"event": "CONNECTION", "data": "user disconnected"}`);
      console.log("LOST CONNECTION - Usuarios conectados: " + wss.clients.size);
      console.log('-----------------');
    });

    socketService.checkNewClient(wss);
  });

  wss.on('close', function close() {
    console.log('Connection closed');
    console.log('-----------------');
  });
}

module.exports = {
  startSockets
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























