const Joi = require("joi");

exports.createLevelContract = Joi.object({
  trackId: Joi.string().required(),
  levelName: Joi.string().required(),
  levelDescription: Joi.string().required(),
  levelState: Joi.string().allow(""),
  passingScore: Joi.number().allow(""),
  employeeRetryInDays: Joi.number().allow(""),
  totalMinutes: Joi.number().allow(""),
  dueDate: Joi.date().allow(""),
  levelType: Joi.string().required(),
  isLocked: Joi.boolean().allow(""),
  allowReattempt: Joi.boolean().allow(""),
});

exports.updateLevelContract = Joi.object({
  id: Joi.string().required(),
  levelName: Joi.string(),
  levelDescription: Joi.string(),
  levelState: Joi.string(),
  passingScore: Joi.number().allow(""),
  employeeRetryInDays: Joi.number().allow(""),
  totalMinutes: Joi.number().allow(""),
  dueDate: Joi.date().allow(""),
  levelType: Joi.string(),
  isLocked: Joi.boolean(),
  allowReattempt: Joi.boolean().allow(""),
});
