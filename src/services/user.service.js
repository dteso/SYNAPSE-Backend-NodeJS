const { UserRepository } = require('../dal/repository/user.repository');
const User = require('../dal/models/user.model');
const { BaseService } = require('./base.service');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../services/helpers/jwt');
const { generateApiKey } = require('generate-api-key');
const { NotificationsService } = require('../services/notifications.service');
const { WELCOME_NOTIFICATION } = require('../services/helpers/notifications.const');
const Notification = require('../dal/models/notification.model');

const getGeneratedAppKey = () => {
    return generateApiKey({
        method: 'string',
        pool: '0123456789abcdef',
        length: 16
    }); // ⇨ 'QFLSGIDLOUAELQZTQXMHQNJ'
}

class UserService extends BaseService {

    userRepository = new UserRepository();

    async getAllusers() {
        try {
            return await this.userRepository.getAllusers();
        } catch (e) {
            throw Error(`>>> UserService: getAllusers() -> Error getting users: + ${e}`);
        }
    }

    async getUserByEmail(email) {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (e) {
            throw Error(`>>> UserService: getUserByEmail() -> Error GETTING USER BY EMAIL: + ${e}`);
        }
    }


    async createUser(req, res) {

        const user = new User(req.body);

        if (req.body.appKey) {
            user.appKey = req.body.appKey;
        } else {
            user.appKey = getGeneratedAppKey();
        }
        if (req.body.notificationId) {
            user.notificationId = req.body.notificationId;
        } else {
            user.notificationId = "";
        }

        /************************************* 
         *       Password encriptation
        *************************************/
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(req.body.password, salt);
        ///////////////////////////////////////

        //Save user
        let dbUser = await this.userRepository.create(user);

        /************************************* 
         *          JWT Generation
        *************************************/
        const token = await generateJWT(dbUser.id);
        ///////////////////////////////////////

        //sendCustomMail('digitalislandsp@gmail.com', dbUser.email, 'Registro completado!!!', 'Tu registro en el sistema se ha completado correctamente');
        this.notifyToUser(dbUser);

        return { user: dbUser, token };
    }

    notifyToUser(dbUser) {
        console.log('Notificar a....', dbUser.notificationId);

        const notification = new Notification(WELCOME_NOTIFICATION(dbUser.notificationId));
        const notificationsService = new NotificationsService();
        notificationsService.notify(notification);
    }
}

module.exports = {
    UserService
}
