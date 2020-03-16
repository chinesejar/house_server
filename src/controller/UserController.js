const userModel = require('../entity/User');
const { putUserSchema } = require('../schema/UserSchema');

class UserController {

  async put(ctx) {
    try {
      const data = await putUserSchema.validateAsync(ctx.request.body);
      const { id } = ctx.state.user;
      return await userModel.updateOne({_id: id}, data);
    } catch (err) {
      ctx.throw(400, err);
    }
  }

}

module.exports = {
  UserController
}