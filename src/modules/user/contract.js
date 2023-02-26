const Joi = require('joi');

exports.registerUserContract = Joi.object({
  email: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginContract = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),

});
