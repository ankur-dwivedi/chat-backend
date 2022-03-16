const Joi = require("joi");

exports.createTrackContract = Joi.object({
  trackName: Joi.string().required(),
  groupId: Joi.array().items(Joi.string().required()).allow(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array(),
  description: Joi.string().required(),
});

exports.createTrackUsingLearnerIdContract = Joi.object({
  trackName: Joi.string().required(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array(),
  description: Joi.string().required(),
  learnerIds:Joi.array().required(),
});
