const Joi = require('@hapi/joi');

const putUserSchema = Joi.object({
  city: Joi.string()
});

module.exports = {
  putUserSchema
};
