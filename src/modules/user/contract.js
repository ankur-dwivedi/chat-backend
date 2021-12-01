const Joi = require("joi");

exports.registerUserContract = Joi.object({
  username: Joi.string().required(),
  employeeId: Joi.string().allow(''),
  phoneNumber: Joi.number(),
  email: Joi.string().required(),
  name: Joi.string().required(),
  employeeBand: Joi.string().allow(''),
  employeeDepartment: Joi.string().allow(''),
  organization:Joi.string().allow(''),
  role: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginContract = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

exports.editUserContract = Joi.object({
  id:Joi.string().required(),
  username: Joi.string(),
  employeeId: Joi.string().allow(''),
  phoneNumber: Joi.number(),
  email: Joi.string(),
  name: Joi.string(),
  employeeBand: Joi.string().allow(''),
  employeeDepartment: Joi.string().allow(''),
  organization:Joi.string().allow(''),
  role: Joi.string(),
  password: Joi.string(),
})

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});