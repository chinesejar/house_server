var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bizCircleSchema = new Schema({
  name: String,
  href: String,
  district: { type: Schema.Types.ObjectId, ref: 'districtModel' },
}, {
  collection: 'bizCircle',
  autoIndex: true
});

const bizCircleModel = mongoose.model('bizCircleModel', bizCircleSchema);

module.exports = bizCircleModel;
