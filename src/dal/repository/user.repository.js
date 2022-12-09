const User = require('../models/user.model');
const { BaseRepository } = require('./base.repository');

class UserRepository extends BaseRepository {

    async getAllusers() {
        try {
            return await User.find({}, 'nombre email role google'); //Sería como establecer su propio Dto sin necesidad de definirlo. Nos seguiría saliendo el _id y la __v. Esto se soluciona en el user.model.js
        } catch (e) {
            throw Error(`">>> findByEmail() --> " ${e}`);
        }
    }

    async findByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (e) {
            throw Error(`">>> findByEmail() --> " ${e}`);
        }
    }

    async create(user) {
        try {
            return await user.save();
        } catch (e) {
            throw Error(`">>> UserRepository:create() --> " ${e}`);
        }
    }

}

/* EXPORTACIONES */
module.exports = {
    UserRepository
}