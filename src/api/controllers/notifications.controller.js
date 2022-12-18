const { NotificationsService } = require('../../services/notifications.service');
const Notification = require('../../dal/models/notification.model');
const AppNotification = require('../../dal/models/app-notification.model');

class NotificationsController {

    notify = async (req, res = response) => {

        const notification = new Notification(req.body);

        const notificationsService = new NotificationsService();
        try {
            const result = await notificationsService.notify(notification);
            res.status(200).json({
                ok: true,
                message: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }

    createNotification = async (req, res = response) => {
        //const notification = new AppNotification();
        const notificationsService = new NotificationsService();
        try {
            const result = await notificationsService.createNotification(req);
            res.status(200).json({
                ok: true,
                response: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }

    getNotificationsByAppKey = async (req, res = response) => {
        const notificationsService = new NotificationsService();
        try {
            const result = await notificationsService.getNotificationsByAppKey(req);
            res.status(200).json({
                ok: true,
                response: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }

    setToIsRead = async (req, res = response) => {
        const notificationsService = new NotificationsService();
        try {
            const result = await notificationsService.setToIsRead(req);
            res.status(200).json({
                ok: true,
                response: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }

    setListToIsRead = async (req, res = response) => {
        console.log(req.body);
        const notificationsService = new NotificationsService();
        try {
            const result = await notificationsService.setListToIsRead(req);
            res.status(200).json({
                ok: true,
                response: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }


}

module.exports = {
    NotificationsController
}