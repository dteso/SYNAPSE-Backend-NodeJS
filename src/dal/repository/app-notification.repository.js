const AppNotification = require('../models/app-notification.model');
const { BaseRepository } = require('./base.repository');
const { DeviceService } = require('../../services/device.service');

class AppNotificacionRepository extends BaseRepository {

    async getAllNotifications() {
        try {
            return await AppNotification.find({}, 'nombre email role google'); //Sería como establecer su propio Dto sin necesidad de definirlo. Nos seguiría saliendo el _id y la __v. Esto se soluciona en el user.model.js
        } catch (e) {
            throw Error(`">>> findByEmail() --> " ${e}`);
        }
    }

    async findByAppKey(appKey) {
        try {
            return await AppNotification.findOne({ appKey });
        } catch (e) {
            throw Error(`">>> findByEmail() --> " ${e}`);
        }
    }


    async findMessageByIdAndUpdate(id, appKey) {
        try {
            const notificationsByAppKey = await AppNotification.findOne({ appKey });

            const messageToUpdate = notificationsByAppKey.messages.findIndex(message => message._id == id);

            if (messageToUpdate > -1) {
                notificationsByAppKey.messages[messageToUpdate].read = true;
            }

            return await AppNotification.findOneAndUpdate({ appKey }, notificationsByAppKey, { new: true, useFindAndModify: false });

        } catch (e) {
            throw Error(`">>> findMessageByIdAndUpdate() --> " ${e}`);
        }
    }

    async create(appNotification) {
        const appKey = appNotification.appKey;
        const head = appNotification.head;
        const content = appNotification.content;
        const MAC = appNotification.MAC;

        const notificationDb = new AppNotification();
        try {
            const notificationsByAppKey = await AppNotification.findOne({ appKey });

            const deviceService = new DeviceService();
            const deviceDb = await deviceService.getDeviceByMacAndAppKey(MAC, appKey);

            const message = { head, content, device: deviceDb[0], timestamp: new Date(), read: false };

            if (notificationsByAppKey) {
                notificationsByAppKey.messages.push(message);
                return await AppNotification.findOneAndUpdate({ appKey }, notificationsByAppKey, { new: true, useFindAndModify: false });
            } else {
                notificationDb.appKey = appKey;
                notificationDb.messages = [message];
                return await notificationDb.save();
            }
        } catch (e) {
            throw Error(`">>> AppNotificacionRepository:create() --> " ${e}`);
        }
    }
}

/* EXPORTACIONES */
module.exports = {
    AppNotificacionRepository
}