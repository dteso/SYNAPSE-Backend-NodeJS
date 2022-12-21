
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

    async getCustomerById(id) {
        try {
            return await Customer.find({ _id: id }).populate('user', '_id name email google role');
        } catch (e) {
            throw Error(`">>> CustomerRepository:getCustomerById(/cutomerId) --> " ${e}`);
        }
    }

    async deleteCustomerById(id, res) {
        try {
            console.log('borrar por id: ' + id);
            const dbCustomer = await Customer.findById(id);
            if (!dbCustomer) {
                console.log("Customer does not exists");
                return res.status(404).json({
                    ok: false,
                    msg: "Customer does not exists"
                });
            }
            return await Customer.findByIdAndRemove(id, { useFindAndModify: false });
        } catch (e) {
            console.log('Error', e);
            throw Error(`">>> CustomerRepository:deleteCustomerById(/cutomerId) --> " ${e}`);
        }
    }



}

/* EXPORTACIONES */
module.exports = {
    CustomerRepository
}