
const fetch = require('node-fetch');

class NotificationsService {

    async notify(notification) {

        return await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            body: JSON.stringify(notification),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.ONE_SIGNAL_API_KEY // TODO ---> A enviroments
            }
        }).then(res => res.json());
    }

}

module.exports = {
    NotificationsService
}