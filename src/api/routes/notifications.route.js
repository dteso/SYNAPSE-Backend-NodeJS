const { Router } = require('express');

const { NotificationsController } = require('../controllers/notifications.controller');
const controller = new NotificationsController();

const router = Router();

/*************************************************************** 
                      POST: /api/onesignal
****************************************************************/
router.post('/', controller.notify);

module.exports = router;