var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  email: String,
  phone: { type: String, match: /^1[3456789]\d{9}$/, unique: true },
  password: { type: String },
  nickname: { type: String },
  avatar: { type: String },
  gender: { type: Number, enum: [0, 1, 2], default: 0 },
  city: {
    type: mongoose.Types.ObjectId,
    ref: 'cityModel'
  },
  wechat_id: String,
  created_time: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'user',
  autoIndex: true
});

userSchema.index({ phone: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })

const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel;
