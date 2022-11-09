class Notification {

    constructor(notification) {
        this.app_id = notification.app_id;
        this.included_segments = notification.included_segments;
        this.included_player_ids = notification.included_player_ids;
        this.data = notification.data;
        this.contents = notification.contents;
        this.headings = notification.headings;
    }

    app_id = "";
    included_segments = ["Active Users", "Inactive Users"];
    included_player_ids = [""];
    data = { userId: "" };
    contents = { en: "", es: "" };
    headings = { en: "", es: "" };
}

module.exports = Notification;