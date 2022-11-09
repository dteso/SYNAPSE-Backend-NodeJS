const WELCOME_NOTIFICATION = (notificationUserId) => {
    return {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        included_segments: ["Active Users", "Inactive Users"],
        included_player_ids: [""],
        data: { userId: `${notificationUserId}` },
        contents: { en: "👋 Welcome to SMSensorial App. Hope will be usefull for u! 👍", es: "👋 Bienvenido a la App de SMSensorial. Espero que te sea de utilidad. 👍" },
        headings: { en: "You've been registered.", es: "Registro completado!" },
    }
}

const MIN_LEVEL_REACHED_NOTIFICATION = (notificationUserId, deviceName) => {
    return {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        included_segments: ["Active Users", "Inactive Users"],
        included_player_ids: [""],
        data: { userId: `${notificationUserId}` },
        contents: { en: `${deviceName} has detected a low level of liquid.`, es: `El nebulizador ${deviceName} ha detectado bajo nivel de líquido.` },
        headings: { en: `⛽ ${deviceName} needs to be refilled.`, es: `⛽ ${deviceName} necesita recarga.` },
    }
}

const REFILLED_NOTIFICATION = (notificationUserId, deviceName) => {
    return {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        included_segments: ["Active Users", "Inactive Users"],
        included_player_ids: [""],
        data: { userId: `${notificationUserId}` },
        contents: { en: `${deviceName} has been refilled.`, es: `El nebulizador ${deviceName} ha sido recargado.` },
        headings: { en: `✔️ ${deviceName} ready again.`, es: `✔️ ${deviceName} listo de nuevo.` },
    }
}

module.exports = {
    WELCOME_NOTIFICATION,
    MIN_LEVEL_REACHED_NOTIFICATION,
    REFILLED_NOTIFICATION
}