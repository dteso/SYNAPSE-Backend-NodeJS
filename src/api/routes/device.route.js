const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');
const deviceModel = require('../../dal/models/device.model');
const { DeviceController } = require('../controllers/device.controller');

const controller = new DeviceController(deviceModel);

const router = Router();

router.get('/', validateJWT, controller.getEntities);

router.get('/my-user', validateJWT, controller.getDeviceByUserLogged);
router.get('/user/:userId', validateJWT, controller.getDeviceByUserId);
router.get('/:id', validateJWT, controller.getDeviceById);
router.get('/customer/:customerId', validateJWT, controller.getDevicesByCustomer);

router.post('/', validateJWT, controller.create);
router.post('/register', validateJWT, controller.registerDevice);

router.put('/', validateJWT, controller.update);
router.patch('/name', validateJWT, controller.updateName);

router.delete('/:id', validateJWT, controller.delete);


module.exports = router;