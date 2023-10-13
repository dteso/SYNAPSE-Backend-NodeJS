const { Schema, model } = require('mongoose');

//const Schema = mongoose.Schema;

const InfraredDataSchema = Schema({
    key: {
        type: String,
    },
    tv: {
        type: String,
    },
    model: {
        type: String,
    },
    code: {
        type: String,
    },
    adress: {
        type: String
    },
    protocol: {
        type: String,
    },
    command: {
        type: String,
    },
    bits: {
        type: Number,
    },
    rawData: {
        type: String,
    },
    color: {
        type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    appKey: {
        type: String
    },
});

InfraredDataSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject(); // Evita que en la petición get se muestre el id. 
    object.uid = _id;
    return object;
});

module.exports = model('InfraredData', InfraredDataSchema);