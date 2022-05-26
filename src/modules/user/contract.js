const Joi = require("joi");

exports.registerUserContract = Joi.object({
  phoneNumber: Joi.number().allow(""),
  email: Joi.string().allow(""),
  name: Joi.string().required(),
  employeeId: Joi.string().required(),
  employeeData: Joi.array()
    .items({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
    .required(),
  organization: Joi.string().allow(""),
  role: Joi.string().required(),
});

exports.loginContract = Joi.object({
  employeeId: Joi.string().required(),
  password: Joi.string().required(),
  organization: Joi.string().required(),
});

exports.reqOtpForgetPassContract = Joi.object({
  employeeId: Joi.string().required(),
  organization: Joi.string().required(),
});

exports.setSessionContract = Joi.object({
  role: Joi.string().required(),
});

exports.verifyOtpContract = Joi.object({
  employeeId: Joi.string().required(),
  organization: Joi.string().required(),
  otp: Joi.number().required(),
});

exports.editUserContract = Joi.object({
  id: Joi.string().required(),
  employeeId: Joi.string().allow(""),
  phoneNumber: Joi.number(),
  email: Joi.string(),
  name: Joi.string(),
  role: Joi.string(),
  employeeData: Joi.array().items({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }),
  blocked: Joi.boolean(),
  password: Joi.string(),
});

exports.deleteMultipleContract = Joi.object({
  employees: Joi.array().items(Joi.string().required()),
});

exports.deleteSingleContract = Joi.object({
  id: Joi.string().required(),
});

exports.getFilEmpContract = Joi.object({
  data: Joi.array()
    .items({
      name: Joi.string().required(),
      value: Joi.array().items(Joi.string().required()),
    })
    .required(),
});
