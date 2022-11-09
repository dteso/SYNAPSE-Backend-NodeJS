
const fetch = require('node-fetch');

class NotificationsService {

    payload = {
        app_id: "6ccf14a6-dc7f-4489-9b0a-5f76143d764a",
        included_segments: ["Active Users", "Inactive Users"],
        included_player_ids: ["ec9705ca-4d06-49c0-a249-0a31cca4d9c9"],
        data: { userId: "POSTMAN-123456" },
        contents: { en: "English MESSAGE from POSTMAN", es: "MENSAJE en castellano desde POSTMAN" },
        headings: { en: "English TITLE from POSTMAN", es: "TÍTULO en castellano desde POSTMAN" }
    }


    notifyWelcome() {
        fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            body: JSON.stringify(this.payload),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic YzQzMDYyNjMtN2VjZi00ZDc3LTllOGMtZGQwNTUyODAwYzZl'
            }
        }).then(res => res.json())
            .then(json => console.log(json));
    }

}

module.exports = {
    NotificationsService
}