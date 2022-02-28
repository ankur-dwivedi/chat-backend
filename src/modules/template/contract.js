const Joi = require("joi");

exports.createContract = Joi.object({
  type: Joi.string().required(),
  levelId: Joi.string().required(),
  levelType: Joi.string().required(),
  trackId: Joi.string().required(),
  organization: Joi.string().required(),
  question: Joi.object({
    value: Joi.string().required(),
    type: Joi.string().required(),
  }),
  options: Joi.array().items({
    value: Joi.string().required(),
    type: Joi.string().required(),
  }),
  answer: Joi.array().items(Joi.string()),
  importance: Joi.number(),
  information: Joi.object({
    text: Joi.string(),
    media: Joi.string(),
    mediaType: Joi.string(),
  }),
  revealOption: Joi.boolean(),
  templateOrder: Joi.number().allow(""),
});

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});
