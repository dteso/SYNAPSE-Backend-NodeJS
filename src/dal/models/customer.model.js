const { Schema, model } = require('mongoose');

const CustomerSchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    province: {
        type: String
    },
    location: {
        type: String,
    },
    street: {
        type: String,
    },
    contactName: {
        type: String
    },
    telephone: {
        type: String
    },
    email: {
        type: String
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

CustomerSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject(); // Evita que en la petición get se muestre el id. 
    object.uid = _id;
    return object;
});

module.exports = model('Customer', CustomerSchema);