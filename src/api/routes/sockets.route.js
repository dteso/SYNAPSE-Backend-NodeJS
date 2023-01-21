const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');

const { SocketsController } = require('../controllers/sockets.controller');
const controller = new SocketsController();

const router = Router();

router.get('/buildrooms', controller.buildRooms);
router.get('/rooms', controller.getAllRooms);

module.exports = router;