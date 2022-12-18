
const Device = require('../models/device.model');
const { BaseRepository } = require('./base.repository');

class DeviceRepository extends BaseRepository {

    async create(device) {
        try {
            const dev = await device.save();
            console.log(dev);
            return await Device.findById(dev._id).populate('customer', '_id name location');
        } catch (e) {
            throw Error(`">>> DeviceRepository:create() --> " ${e}`);
        }
    }

    //'/devices/:id'
    async getById(id) {
        try {
            return await Device.findById(id).populate('user', '_id name email google role').populate('customer', '_id name location');
        } catch (e) {
            throw Error(`">>> BaseRepository:get(/id) --> " ${e}`);
        }
    }


    async getDevicesByUserId(id) {
        try {
            return await Device.find({ user: id }).populate('user', '_id name email google role').populate('customer', '_id name location');
        } catch (e) {
            throw Error(`">>> BaseRepository:getByUser(/userId) --> " ${e}`);
        }
    }

    async getDeviceByMacAndAppKey(MAC, appKey) {
        try {
            return await Device.find({ MAC, appKey }).populate('user', '_id name email google role notificationId').populate('customer', '_id name location');
        } catch (e) {
            throw Error(`">>> BaseRepository:getByUser(/userId) --> " ${e}`);
        }
    }

    async getDevicesByCustomerId(customerId) {
        try {
            return await Device.find({ customer: customerId }).populate('user', '_id name email google role notificationId').populate('customer', '_id name location');
        } catch (e) {
            throw Error(`">>> BaseRepository:getByUser(/userId) --> " ${e}`);
        }
    }

    async updateName(MAC, appKey, name) {
        try {
            const deviceDb = await Device.findOne({ MAC, appKey }).populate('user', '_id name email google role notificationId').populate('customer', '_id name location');
            deviceDb.name = name;
            return await Device.updateOne(deviceDb);
        } catch (e) {
            throw Error(`">>> BaseRepository:getByUser(/userId) --> " ${e}`);
        }
    }

    async updateDeviceStatus(MAC, appKey, minLevelReached, name) {
        try {
            const deviceDb = await Device.findOne({ MAC, appKey }).populate('user', '_id name email google role notificationId').populate('customer', '_id name location');

            if (!deviceDb) return;

            deviceDb.lastEvent = new Date();

            if (minLevelReached === "NO") {
                deviceDb.lastRefill = new Date();
            }

            //deviceDb.minLevelReached = minLevelReached;
            deviceDb.name = name;
            return await Device.findOneAndUpdate({ MAC, appKey }, deviceDb, { new: true, useFindAndModify: false });
        } catch (e) {
            throw Error(`">>> BaseRepository:getByUser(/userId) --> " ${e}`);
        }
    }

}

/* EXPORTACIONES */
module.exports = {
    DeviceRepository
}