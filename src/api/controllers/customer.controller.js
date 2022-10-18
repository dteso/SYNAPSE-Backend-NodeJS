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
}

module.exports = {
    CustomerController
}