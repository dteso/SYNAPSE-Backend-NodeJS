
const Customer = require('../models/customer.model');
const { BaseRepository } = require('./base.repository');

class CustomerRepository extends BaseRepository {

    async create(customer) {
        try {
            return await customer.save();
        } catch (e) {
            throw Error(`">>> CustomerRepository:create() --> " ${e}`);
        }
    }

    async getCustomersByUserId(id) {
        try {
            return await Customer.find({ user: id }).populate('user', '_id name email google role');
        } catch (e) {
            throw Error(`">>> CustomerRepository:getCustomersByUserId(/userId) --> " ${e}`);
        }
    }
}

/* EXPORTACIONES */
module.exports = {
    CustomerRepository
}