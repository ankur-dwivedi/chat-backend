const Joi = require("joi");

exports.createJourneyContract = Joi.object({
  groupId: Joi.string().required(),
  submittedAnswer: Joi.string().allow(""),
  templateId: Joi.string().required(),
  timeSpend: Joi.number().required(),
  anyIssue: Joi.string().allow(""),
});
