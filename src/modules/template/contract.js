const Joi = require("joi");

exports.createContract = Joi.object({
  type: Joi.string().required(),
  levelId: Joi.string().required(),
  trackId: Joi.string().required(),
  organization: Joi.string().required(),
  question: Joi.object({
    value: Joi.string().required(),
    type: Joi.string().required(),
  }),
  media: Joi.object({
    value: Joi.string().required(),
    type: Joi.string().required(),
  }).allow(""),
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
  }).allow(""),
  revealOption: Joi.boolean(),
  templateOrder: Joi.number().min(0),
});

exports.deleteContract = Joi.object({
  id: Joi.string().required(),
});

exports.createFeedbackContract = Joi.object({
  templateId: Joi.string().required(),
  feedback: Joi.array().items(Joi.string()).required(),
  feedbackType: Joi.string().required(),
});

exports.setTemplateOrder = Joi.object({
  levelId: Joi.string().required(), //to authenticate creator
  templateData: Joi.array()
    .items(
      Joi.object({
        templateId: Joi.string().required(),
        templateOrder: Joi.number().required().min(0),
      })
    )
    .required(),
});
