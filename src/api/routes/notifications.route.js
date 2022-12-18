const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');

const { NotificationsController } = require('../controllers/notifications.controller');
const controller = new NotificationsController();

const router = Router();

/*************************************************************** 
                      POST: /api/onesignal
****************************************************************/
router.post('/', controller.notify);
router.post('/create-notification', validateJWT, controller.createNotification);
router.get('/my-notifications', validateJWT, controller.getNotificationsByAppKey);
router.patch('/set-to-read', validateJWT, controller.setToIsRead);
router.patch('/set-many-to-read', validateJWT, controller.setListToIsRead);

module.exports = router;