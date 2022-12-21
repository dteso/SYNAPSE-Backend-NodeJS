const { BaseController } = require('./base.controller');
const { CustomerService } = require('../../services/customer.service');

class CustomerController extends BaseController {

    constructor(model) {
        super(model);
    }

    async registerCustomerByLoggeduser(req, res) {
        try {
            const customerService = new CustomerService();
            const dbCustomer = await customerService.registerCustomerByLoggeduser(req, res);

            res.status(200).json({
                ok: true,
                msg: `Device ${dbCustomer.name} CREATED sucessfully`,
                dbCustomer
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    async getCustomersByUserLogged(req, res) {
        try {
            const customerService = new CustomerService();
            const dbCustomers = await customerService.getCustomerByLoggedUser(req, res);
            res.status(200).json({
                ok: true,
                msg: `Customers OBTAINED sucessfully by logged user`,
                dbCustomers
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    async getCustomerDetailsWithDevices(req, res) {
        try {
            const customerService = new CustomerService();
            const response = await customerService.getCustomerDetailsWithDevices(req, res);
            res.status(200).json({
                ok: true,
                msg: `Customer OBTAINED sucessfully by customerId`,
                customer: response.customers[0],
                devices: response.devicesByCustomer
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error
            });
        }
    }

    async deleteCustomerById(req, res) {
        try {
            const customerService = new CustomerService();
            const response = await customerService.deleteCustomerById(req, res);
            console.log(response);
            res.status(200).json({
                ok: true,
                msg: `Customer DELETED sucessfully by customerId`,
                response
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
    CustomerController
}