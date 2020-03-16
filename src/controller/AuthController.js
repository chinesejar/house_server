const axios = require('axios');
const jwt = require('jsonwebtoken');
const userModel = require('../entity/User');
const { authSchema, wechatAuthSchema } = require('../schema/AuthSchema');

const { APP_ID, APP_SECRET, JWT_SECRET } = process.env;

class AuthController {

  async login(ctx) {
    try {
      const data = await authSchema.validateAsync(ctx.request.body);
      const user = await userModel.findOne(data);
      if (!user) ctx.throw(404, 'user not found');
      const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
      return { token };
    } catch (err) {
      ctx.throw(400, err);
    }
  }

  async wechatAuth(ctx) {
    try {
      const data = await wechatAuthSchema.validateAsync(ctx.request.body);
      const { code, nickname, avatar, gender } = data;
      const session = (await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })).data;
      if (session.errcode) ctx.throw(400, session.errmsg);
      let user = await userModel.findOne({ wechat_id: session.openid });
      if (!user) {
        user = await userModel.create({ wechat_id: session.openid, nickname, avatar, gender });
      }
      const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
      ctx.body = { token };
    } catch (err) {
      ctx.throw(400, err);
    }
  }
}

module.exports = {
  AuthController
}