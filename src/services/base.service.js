const { BaseRepository } = require('../dal/repository/base.repository');

class BaseService {

    _model;

    constructor(model) {
        this._model = model;
    }

    async getEntities (req, res) {
        try {
            const baseRepository = new BaseRepository(this._model);
            return await baseRepository.get(req, res);
        } catch (e) {
            throw Error(`>>> BaseService: get() -> Error getting entities: + ${e}`);
        }
    }
}

module.exports = {
    BaseService
}

