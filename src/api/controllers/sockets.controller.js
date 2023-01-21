const { SocketService } = require('../../sockets/socket-service');

class SocketsController {

    buildRooms = async (req, res = response) => {
        const sockets = new SocketService();
        try {
            const result = await sockets.buildInitialRooms();
            res.status(200).json({
                ok: true,
                message: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }

    getAllRooms = async (req, res = response) => {
        const sockets = new SocketService();
        try {
            const result = await sockets.getAllRooms();
            res.status(200).json({
                ok: true,
                rooms: result
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                ok: false,
                error: err
            })
        }
    }
}

module.exports = {
    SocketsController
}