const WELCOME_NOTIFICATION = (notificationUserId) => {
    return {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        included_segments: ["Active Users", "Inactive Users"],
        included_player_ids: [""],
        data: { userId: `${notificationUserId}` },
        contents: { en: "Welcome to SMSensorial App. Enjoy!", es: "Bienvenido a la App de SMSensorial. Espero que te sea de utilidad." },
        headings: { en: "You've been registered", es: "Registro completado!" },
    }
}

module.exports = {
    WELCOME_NOTIFICATION
}