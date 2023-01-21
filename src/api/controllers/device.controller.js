const { BaseController } = require('./base.controller');
const { DeviceService } = require('../../services/device.service');
const { SocketService } = require('../../sockets/socket-service');

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
            const id = req.params.is;
            const dbDevice = await deviceService.getDeviceById(id);

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

    async getDevicesByCustomer(req, res) {
        try {
            const deviceService = new DeviceService();
            const customerId = req.params.customerId;
            const dbDevices = await deviceService.getDevicesByCustomerId(customerId);
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


    async updateName(req, res) {
        try {
            const deviceService = new DeviceService();
            const dbDevices = await deviceService.updateDeviceName(req, res);
            res.status(200).json({
                ok: true,
                msg: `Device NAME UPDATED sucessfully`,
                dbDevices
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    delete = async (req, res = response) => {
        const sockets = new SocketService();
        console.log("DELETE REQUEST");
        const uid = req.params.id;
        try {
            const dbEntity = await this._model.findById(uid);
            if (!dbEntity) {
                console.log("Entity does not exists");
                return res.status(404).json({
                    ok: false,
                    msg: "Entity not found by Id = " + uid
                });
            }
            await this._model.findByIdAndDelete(uid);
            await sockets.buildInitialRooms();
            return res.json({
                ok: true,
                msg: `${this._model.modelName} uid = ${uid} DELETED sucessfully`,
                entity: dbEntity
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                error: error
            });
        }

    }
}

module.exports = {
    DeviceController
}