const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');

const { InfraredDataController } = require('../controllers/infrared-data.controller');
const controller = new InfraredDataController();

const router = Router();

router.post('/save', controller.registerInfraredData);
router.get('/appKey/:appKey', controller.getInfraredDataByAppKey);

module.exports = router;