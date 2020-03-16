var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var districtSchema = new Schema({
  name: String,
  href: String,
  city: { type: Schema.Types.ObjectId, ref: 'cityModel' },
}, {
  collection: 'district',
  autoIndex: true
});

const districtModel = mongoose.model('districtModel', districtSchema);

module.exports = districtModel;
