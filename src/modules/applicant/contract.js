const Joi = require('joi');

exports.create = Joi.object({
  name: Joi.string().required(),
  emailAddress: Joi.string().required(),
  linkedin: Joi.string().required(),
  otherLink: Joi.string().required(),
  resume: Joi.string().required(),
  jobId: Joi.string().required(),
  jobTitle: Joi.string().required(),
});
