
const Device = require('../models/device.model');

class DeviceRepository {

    async create(device) {

        try {
            return await device.save();
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
}

/* EXPORTACIONES */
module.exports = {
    DeviceRepository
}