const Joi = require("joi");

exports.createTrackContract = Joi.object({
  trackName: Joi.string().required(),
  groupId: Joi.array().allow(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array().allow(),
  description: Joi.string().required(),
});

exports.createTrackUsingLearnerIdContract = Joi.object({
  trackName: Joi.string().required(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array().allow(),
  description: Joi.string().required(),
  learnerIds: Joi.array().allow(),
});

exports.updateTrackUsingLearnerIdContract = Joi.object({
  trackName: Joi.string().allow(),
  selectedTheme: Joi.string().allow(),
  skillTag: Joi.array().allow(),
  description: Joi.string().allow(),
  learnerIds: Joi.array().required(),
  singleGroupId: Joi.string().allow(),
  organization: Joi.string().allow()
});

exports.transferTrackOwnerContract = Joi.object({
  newUserId: Joi.string().required(),
  trackId: Joi.array().required(),
});
