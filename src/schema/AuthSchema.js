const Joi = require('@hapi/joi');

const authSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3456789]\d{9}$/),
  email: Joi.string().email(),
  username: Joi.string(),
  password: Joi.string().min(6).max(30).required(),
}).or('phone', 'email', 'username');

const wechatAuthSchema = Joi.object({
  code: Joi.string().required(),
  avatar: Joi.string().uri().required(),
  nickname: Joi.string().required(),
  gender: Joi.number().min(0).max(2).required(),
})

module.exports = {
  authSchema, wechatAuthSchema
};
