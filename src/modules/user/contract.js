const Joi = require("joi");

exports.registerUserContract = Joi.object({
  username: Joi.string().required(),
  employeeId: Joi.string(),
  phoneNumber: Joi.number().required(),
  email: Joi.string().required(),
  name: Joi.string().required(),
  employeeId: Joi.string().required(),
  employeeData:Joi.array()
  .items({
    name: Joi.string()
      .required(),
      value: Joi.string()
      .required(),
  }).required(),
  organization:Joi.string().allow(''),
  role: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginContract = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

exports.learnerLoginContract = Joi.object({
  employeeId: Joi.string().required(),
  password: Joi.string().required(),
});

exports.editUserContract = Joi.object({
  id:Joi.string().required(),
  employeeId: Joi.string().required(),
  username: Joi.string(),
  employeeId: Joi.string().allow(''),
  phoneNumber: Joi.number(),
  email: Joi.string(),
  name: Joi.string(),
  organization:Joi.string().allow(''),
  role: Joi.string(),
  password: Joi.string(),
})

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});