const { BaseController } = require('./base.controller');
const { DeviceService } = require('../../services/device.service');

class DeviceController extends BaseController {

    constructor(model) {
        super(model);
    }

    async registerDevice(req, res) {
        try {
            const deviceService = new DeviceService();
            const dbDevice = await deviceService.register(req, res);

            res.status(200).json({
                ok: true,
                msg: `Device ${dbDevice.name} CREATED sucessfully`,
                dbDevice
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    async getDeviceById(req, res) {
        try {
            const deviceService = new DeviceService();
            const dbDevice = await deviceService.getDeviceById(req, res);

            res.status(200).json({
                ok: true,
                msg: `Device ${dbDevice.name} OBTAINED sucessfully`,
                dbDevice
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }

    }


    async getDeviceByUserId(req, res) {
        try {
            const deviceService = new DeviceService();
            const dbDevices = await deviceService.getDeviceByUserId(req, res);

            res.status(200).json({
                ok: true,
                msg: `Devices OBTAINED sucessfully`,
                dbDevices
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    async getDeviceByUserLogged(req, res) {
        try {
            const deviceService = new DeviceService();
            const dbDevices = await deviceService.getDeviceByLoggedUser(req, res);
            res.status(200).json({
                ok: true,
                msg: `Devices OBTAINED sucessfully`,
                dbDevices
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
    DeviceController
}