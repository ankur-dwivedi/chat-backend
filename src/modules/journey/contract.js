const Joi = require("joi");

exports.createJourneyContract = Joi.object({
  groupId: Joi.string().required(),
  submittedAnswer: Joi.string().required(),
  templateId: Joi.string().required(),
  timeSpend: Joi.number().required(),
  anyIssue: Joi.string().allow(""),
});
