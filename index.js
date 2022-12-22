require('dotenv').config();
const path = require('path');
const { startSockets } = require('./src/sockets/socket-server');

const express = require('express');
const cors = require('cors');

const { dbConnection } = require('./database/config');

//CREACIÓN DEL SERVIDOR EXPRESS
const app = express();
const appShared = express();

var corsOptions = {
  // origin: 'http://192.168.1.41:4200', //local --host
  // origin: 'http://localhost:4200', local serve
  // origin: 'http://localhost:3000', PRE
  origins: [
    'https://smsensorial-monitor.herokuapp.com',
    'http://92.56.96.192:4200',
    'http://192.168.1.41:3000',
    'http://192.168.1.41:4200',
    'http://localhost:4200',
    'http://localhost:64117']
  ,
  optionsSuccessStatus: 200 // For legacy browser support
}

//CONFIGURAR CORS
app.use(cors(corsOptions));

//PARSEO DEL BODY
app.use(express.json());

app.use('/protected/*', require('./src/api/routes/shared.route')); //De esta forma habilitamos una ruta protegida por autenticación al estar servida en la carpeta publica /shared
appShared.use(express.static('shared'));
app.use('/', appShared); //De esta forma la carpeta shared será accesible simplemente con la url del api

//CONEXIÓN BASE DE DATOS
dbConnection();

//RUTAS
app.use('/api/log', require('./src/api/routes/log.route'));
app.use('/api/users', require('./src/api/routes/user.route'));
app.use('/api/login', require('./src/api/routes/auth.route'));
app.use('/api/dispatcher/mail', require('./src/api/routes/dispatcher.route'));
app.use('/api/notifications', require('./src/api/routes/newsletter.route'));
app.use('/api/upload', require('./src/api/routes/file.route'));
app.use('/api/devices', require('./src/api/routes/device.route'));
app.use('/api/customers', require('./src/api/routes/customer.route'));
app.use('/api/onesignal', require('./src/api/routes/notifications.route'));

/* Mantener la navegación del usuario siempre en nuestro dominio */
app.get('*', (req, res) => {
  // console.log(path.join(__dirname, 'shared', 'index.html'));
  const index = path.join(__dirname, 'shared', '/client/build/index.html');
  res.sendFile(index);
});

let server = app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});

startSockets(server);