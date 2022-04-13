const Joi = require("joi");

exports.createTrackContract = Joi.object({
  trackName: Joi.string().required(),
  // groupId: Joi.array().items(Joi.string().required()).allow(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array().allow(),
  description: Joi.string().required(),
});

exports.createTrackUsingLearnerIdContract = Joi.object({
  trackName: Joi.string().required(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array().allow(),
  description: Joi.string().required(),
  learnerIds: Joi.array().required(),
});

exports.updateTrackUsingLearnerIdContract = Joi.object({
  trackName: Joi.string().required(),
  selectedTheme: Joi.string().required(),
  skillTag: Joi.array().allow(),
  description: Joi.string().required(),
  learnerIds: Joi.array().required(),
  deleteGroupId: Joi.array().allow(),
  organization: Joi.string().allow()
});

exports.transferTrackOwnerContract = Joi.object({
  newUserId: Joi.string().required(),
  trackId: Joi.array().required(),
});
