const { CustomerRepository } = require('../dal/repository/customer.repository');
const Customer = require('../dal/models/customer.model');
const { BaseService } = require('./base.service');

class CustomerService extends BaseService {

    customerRepository = new CustomerRepository();

    async registerCustomerByLoggeduser(req, res) {
        try {
            const customerToSave = new Customer(req.body);
            customerToSave.user = req.uid;
            return await this.customerRepository.create(customerToSave);
        } catch (e) {
            throw Error(`>>> CustomerService: registerCustomerByLoggeduser() -> Error creating Customer: + ${e}`);
        }
    }

    async getCustomerByLoggedUser(req, res) {
        try {
            let userId = req.uid;
            console.log(userId);
            return await this.customerRepository.getCustomersByUserId(userId);
        } catch (e) {
            throw Error(`>>> CustomerService: getCustomerByLoggedUser() -> Error getting Customers: + ${e}`);
        }
    }

}

module.exports = {
    CustomerService
}

