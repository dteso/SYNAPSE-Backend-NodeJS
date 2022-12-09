
const fetch = require('node-fetch');
const AppNotification = require('../dal/models/app-notification.model');
const { AppNotificacionRepository } = require('../dal/repository/app-notification.repository');

const { BaseService } = require('./base.service');

class NotificationsService extends BaseService {

    async notify(notification) {

        return await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            body: JSON.stringify(notification),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.ONE_SIGNAL_API_KEY
            }
        }).then(res => res.json());
    }

    async createNotification(req) {
        const appNotificationRepository = new AppNotificacionRepository();
        try {
            return await appNotificationRepository.create(req.body);
        } catch (e) {
            throw Error(`>>> DeviceService: createNotification() -> Error CREATING NOTIFICATION IN DB: + ${e}`);
        }
    }

    async createAndNotify(appKey, MAC, notification) {
        const appNotificationRepository = new AppNotificacionRepository();
        try {
            const createDto = { appKey, MAC, head: notification.headings.es, content: notification.contents.es };
            await appNotificationRepository.create(createDto);
            return await this.notify(notification);
        } catch (e) {
            throw Error(`>>> DeviceService: createNotification() -> Error CREATING NOTIFICATION IN DB: + ${e}`);
        }
    }

    async getNotificationsByAppKey(req) {
        const appKey = req.appKey;
        const appNotificationRepository = new AppNotificacionRepository();
        try {
            return await appNotificationRepository.findByAppKey(appKey);
        } catch (e) {
            throw Error(`>>> DeviceService: getNotificationsByAppKey() -> Error GETTING NOTIFICATIONS BY APPKEY: + ${e}`);
        }
    }

    async setToIsRead(req) {
        const messageId = req.body.messageId;
        const appKey = req.appKey;
        const appNotificationRepository = new AppNotificacionRepository();
        try {
            return await appNotificationRepository.findMessageByIdAndUpdate(messageId, appKey);
        } catch (e) {
            throw Error(`>>> DeviceService: getNotificationsByAppKey() -> Error GETTING NOTIFICATIONS BY APPKEY: + ${e}`);
        }
    }


}

module.exports = {
    NotificationsService
}