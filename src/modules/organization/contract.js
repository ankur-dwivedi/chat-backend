const Joi = require("joi");

exports.createOrganizationContract = Joi.object({
  name: Joi.string().required(),
  logo: Joi.string().allow(''),
});

exports.editOrganizationContract = Joi.object({
  id:Joi.string().required(),
  name: Joi.string(),
  logo: Joi.string(),
})

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});