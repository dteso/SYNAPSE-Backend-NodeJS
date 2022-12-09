const { Schema, model } = require('mongoose');

//const Schema = mongoose.Schema;

const NotifMessageSchema = Schema({
    msg: {
        type: String
    },
    timestamp: {
        type: Date
    },
    read: {
        type: Boolean
    }
});

NotifMessageSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject(); // Evita que en la petición get se muestre el id. 
    object.uid = _id;
    return object;
});

module.exports = model('NotifMessage', NotifMessageSchema);