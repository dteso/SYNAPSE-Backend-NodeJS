const { CustomerRepository } = require('../dal/repository/customer.repository');
const Customer = require('../dal/models/customer.model');
const { BaseService } = require('./base.service');
const { DeviceService } = require('./device.service');

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


    async deleteCustomerById(req, res) {
        try {
            let customerId = req.params.id;
            console.log(customerId);
            return await this.customerRepository.deleteCustomerById(customerId, res);
        } catch (e) {
            throw Error(`>>> CustomerService: deleteCustomerById(${id}) -> Error deleting Customer: + ${e}`);
        }
    }


    async getCustomerDetailsWithDevices(req, res) {
        try {
            let customerId = req.params.id;
            console.log(customerId);

            const deviceService = new DeviceService();
            const devicesByCustomer = await deviceService.getDevicesByCustomerId(customerId);
            console.log('Devices by cusotmer', devicesByCustomer);
            const customers = await this.customerRepository.getCustomerById(customerId);
            const response = {
                customers,
                devicesByCustomer
            }
            return response;
        } catch (e) {
            throw Error(`>>> CustomerService: getCustomerByLoggedUser() -> Error getting Customers: + ${e}`);
        }
    }



}

module.exports = {
    CustomerService
}

