const { DeviceRepository } = require('../dal/repository/device.repository');
const Device = require('../dal/models/device.model');
const { BaseService } = require('./base.service');

class DeviceService extends BaseService {

    deviceRepository = new DeviceRepository();

    async register(req, res) {
        try {
            const deviceToSave = new Device(req.body);

            console.log("REQ UID", req.uid);
            deviceToSave.user = req.uid;

            console.log("device to save", deviceToSave);

            return await this.deviceRepository.create(deviceToSave);
        } catch (e) {
            throw Error(`>>> DeviceService: register() -> Error creating device: + ${e}`);
        }
    }

    async getDeviceById(req, res) {
        try {
            let id = req.params.id;
            return await this.deviceRepository.getById(id);
        } catch (e) {
            throw Error(`>>> DeviceService: getDeviceById() -> Error getting device: + ${e}`);
        }
    }


    async getDeviceByUserId(req, res) {
        try {
            let userId = req.params.userId;
            return await this.deviceRepository.getDevicesByUserId(userId);
        } catch (e) {
            throw Error(`>>> DeviceService: getDeviceByUserId() -> Error getting devices: + ${e}`);
        }
    }

    async getDeviceByLoggedUser(req, res) {
        try {
            let userId = req.uid;
            return await this.deviceRepository.getDevicesByUserId(userId);
        } catch (e) {
            throw Error(`>>> DeviceService: getDeviceByLoggedUser() -> Error getting devices: + ${e}`);
        }
    }


    async getDeviceByMacAndAppKey(MAC, appKey) {
        try {
            return await this.deviceRepository.getDeviceByMacAndAppKey(MAC, appKey);
        } catch (e) {
            throw Error(`>>> DeviceService: getDeviceByLoggedUser() -> Error getting devices: + ${e}`);
        }
    }
}

module.exports = {
    DeviceService
}

