var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

var communitySchema = new Schema({
  name: {type: String, required: true },
  href: {type: String, required: true },
  img: String,
  code: {type: String, required: true },
  location: { type: pointSchema },
  province: { type: Schema.Types.ObjectId, ref: 'province' },
  building_type: String,
  property_cost: String,
  property_manager: String,
  developer: String,
  building_count: String,
  house_count: String,
  biz_circle: { type: Schema.Types.ObjectId, ref: 'bizCircleModel' },
}, {
  collection: 'community',
  autoIndex: true
});

const communityModel = mongoose.model('communityModel', communitySchema);

module.exports = communityModel;
