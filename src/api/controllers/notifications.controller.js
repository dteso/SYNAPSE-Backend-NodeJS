const { NotificationsService } = require('../../services/notifications.service');

class NotificationsController {

    notify = async (req, res = response) => {

        const notificationsService = new NotificationsService();
        try {
            await notificationsService.notifyWelcome();
            res.status(200).json({
                ok: true,
                message: 'user_successfully_notified'
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