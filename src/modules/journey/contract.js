const Joi = require("joi");

exports.createJourneyContract = Joi.object({
  submittedAnswer: Joi.string().allow(""),
  templateId: Joi.string().required(),
  timeSpend: Joi.number().required(),
  anyIssue: Joi.string().allow(""),
});

exports.closeAttemptContract = Joi.object({
  levelId: Joi.string().required(),
});
