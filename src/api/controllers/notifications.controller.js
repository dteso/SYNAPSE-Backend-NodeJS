const { NotificationsService } = require('../../services/notifications.service');
const Notification = require('../../dal/models/notification.model');

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

}

module.exports = {
    NotificationsController
}