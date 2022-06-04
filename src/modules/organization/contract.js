const Joi = require("joi");

exports.createOrganizationContract = Joi.object({
  name: Joi.string().required(),
  logo: Joi.string().allow(""),
  domain: Joi.string().required(),
  revenueScheme: Joi.string().allow(""),
  licenseExpiryDate: Joi.date().allow(""),
});

exports.editOrganizationContract = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  logo: Joi.string(),
});

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});

exports.replaceOrganizationContract = Joi.object({
  org: Joi.string(),
  role: Joi.string().allow(""),
});
