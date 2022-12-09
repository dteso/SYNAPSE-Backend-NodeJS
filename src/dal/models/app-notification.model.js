const { Schema, model } = require('mongoose');

//const Schema = mongoose.Schema;

const AppNotificationSchema = Schema({
    appKey: {
        type: String,
        required: true,
        unique: true
    },
    messages: [{
        head: {
            type: String
        },
        content: {
            type: String
        },
        timestamp: {
            type: Date
        },
        read: {
            type: Boolean
        },
        device: {
            type: Schema.Types.ObjectId, ref: 'Device', required: false,
        }
    }]
});

AppNotificationSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject(); // Evita que en la petición get se muestre el id. 
    object.uid = _id;
    return object;
});

module.exports = model('AppNotification', AppNotificationSchema);