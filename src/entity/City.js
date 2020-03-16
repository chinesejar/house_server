var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var citySchema = new Schema({
  pinyin: String,
  name: String,
  href: String,
  province: { type: Schema.Types.ObjectId, ref: 'provinceModel' },
}, {
  collection: 'city',
  autoIndex: true
});

const cityModel = mongoose.model('cityModel', citySchema);

module.exports = cityModel;
