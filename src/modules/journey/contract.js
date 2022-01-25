const Joi = require("joi");

exports.createJourneyContract = Joi.object({
  groupId: Joi.string().required(),
  trackId: Joi.string().required(),
  levelId: Joi.string().required(),
  submittedAnswer: Joi.string().required(),
  isSubmittedAnswerCorrect: Joi.boolean().required(),
  templateId: Joi.string().required(),
  timeSpend: Joi.number().required(),
  anyIssue: Joi.string().allow(''),
});
