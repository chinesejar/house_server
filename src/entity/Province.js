var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var provinceSchema = new Schema({
  pinyin: String,
  name: { type: String, unique: true, required: true },
}, {
  collection: 'province',
  autoIndex: true
});

const provinceModel = mongoose.model('provinceModel', provinceSchema);

module.exports = provinceModel;
