
const InfraredData = require('../models/infrared-data.model');
const { BaseRepository } = require('./base.repository');

class InfraredDataRepository extends BaseRepository {

    async create(infraredData) {
        try {
            const irData = await infraredData.save();
            return await InfraredData.findById(irData._id).populate('user', '_id name location');
        } catch (e) {
            throw Error(`">>> InfraredDataRepository:create() --> " ${e}`);
        }
    }

    async getInfraredDataByAppKey(appKey) {
        try {
            return await InfraredData.find({ appKey });
        } catch (e) {
            throw Error(`">>> InfraredDataRepository:getInfraredDataByAppKey(/appKey) --> " ${e}`);
        }
    }
}

/* EXPORTACIONES */
module.exports = {
    InfraredDataRepository
}