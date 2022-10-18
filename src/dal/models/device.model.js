const { Schema, model } = require('mongoose');

//const Schema = mongoose.Schema;

const DeviceSchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ip: {
    type: String,
    required: true,
  }
  ,
  ssid: {
    type: String,
    required: true
  },
  minLevelReached: {
    type: String,
  },
  MAC: {
    type: String,
    required: true,
    unique: true
  },
  hum: {
    type: String,
  },
  temp: {
    type: String,
  }
  ,
  rssi: {
    type: String,
  },
  type: {
    type: String,
  },
  provincia: {
    type: String
  },
  localidad: {
    type: String
  },
  adress: {
    type: String
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: false }
});

DeviceSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject(); // Evita que en la petición get se muestre el id. 
  object.uid = _id;
  return object;
});

module.exports = model('Device', DeviceSchema);