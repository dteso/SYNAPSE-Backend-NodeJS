const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');
const customerModel = require('../../dal/models/customer.model');
const { CustomerController } = require('../controllers/customer.controller');

const controller = new CustomerController(customerModel);

const router = Router();

router.get('/my-user', validateJWT, controller.getCustomersByUserLogged);
router.get('/', validateJWT, controller.getEntities);
router.get('/id/:id', validateJWT, controller.getCustomerDetailsWithDevices);

//router.get('/:id', validateJWT, controller.getCustomerById);

router.post('/', validateJWT, controller.create);
router.post('/my-user', validateJWT, controller.registerCustomerByLoggeduser);

router.put('/', validateJWT, controller.update);

router.delete('/', validateJWT, controller.delete);
router.delete('/id/:id', validateJWT, controller.deleteCustomerById);


module.exports = router;