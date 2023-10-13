const { InfraredDataRepository } = require('../dal/repository/infrared-data.repository');
const InfraredData = require('../dal/models/infrared-data.model');
const { BaseService } = require('./base.service');

class InfraredDataService extends BaseService {

    infraredDataRepository = new InfraredDataRepository();

    constructor(model) {
        super(model);
    }

    async register(req, res) {
        try {
            const infraredDataToSave = new InfraredData(req);

            console.log("REQ UID", req.uid);
            infraredDataToSave.user = req.uid;
            console.log("InfraredData to save", infraredDataToSave);
            return await this.infraredDataRepository.create(infraredDataToSave);
        } catch (e) {
            throw Error(`>>> InfraredDataService: register() -> Error creating InfraredData: + ${e}`);
        }
    }

    async getInfraredDataByAppKey(appKey) {
        try {
            return await this.infraredDataRepository.getInfraredDataByAppKey(appKey);
        } catch (e) {
            throw Error(`>>> InfraredDataService: getInfraredDataByAppKey() -> Error getting infrarred data: + ${e}`);
        }
    }


}

module.exports = {
    InfraredDataService
}

