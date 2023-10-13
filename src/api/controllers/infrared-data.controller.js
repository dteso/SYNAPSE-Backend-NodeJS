const { BaseController } = require('./base.controller');
const { InfraredDataService } = require('../../services/infrared-data.service');
const { SocketService } = require('../../sockets/socket-service');

class InfraredDataController extends BaseController {

    constructor(model) {
        super(model);
    }

    async registerInfraredData(req, res) {
        try {
            const infraredDataService = new InfraredDataService();
            const dbInfraredData = await infraredDataService.register(req, res);

            res.status(200).json({
                ok: true,
                msg: `InfraredData ${dbInfraredData.name} CREATED sucessfully`,
                dbInfraredData
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }


    async getInfraredDataByAppKey(req, res) {
        try {
            const infraredDataService = new InfraredDataService();
            const appKey = req.params.appKey;
            const irDataList = await infraredDataService.getInfraredDataByAppKey(appKey);
            res.status(200).json({
                ok: true,
                msg: `Devices OBTAINED sucessfully`,
                irDataList
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

}

module.exports = {
    InfraredDataController
}