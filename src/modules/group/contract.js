const Joi = require("joi");

exports.createContract = Joi.object({
  name: Joi.string().required(),
  organization: Joi.string().required(),
  description: Joi.string().required(),
  properties: Joi.array()
  .items({
    name: Joi.string()
      .required(),
    value: Joi.array()
    .items(Joi.string()
      .required()),
  }).required(),
});

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});