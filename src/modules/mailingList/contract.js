const Joi = require("joi");

exports.create = Joi.object({
  emailAddress: Joi.string().required(),
  timeStamp: Joi.string().required(),
});
