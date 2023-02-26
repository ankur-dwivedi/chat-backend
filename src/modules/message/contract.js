const Joi = require('joi');

exports.createMessageContract = Joi.object({
  text: Joi.string().required(),
  receiver: Joi.string().required(),
});

exports.getMessageContract = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
});
