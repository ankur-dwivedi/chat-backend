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
});

exports.updateLevelContract = Joi.object({
  id: Joi.string().required(),
  levelName: Joi.string(),
  levelDescription: Joi.string(),
  levelState: Joi.string(),
  passingScore: Joi.number(),
  employeeRetryInDays: Joi.number(),
  totalMinutes: Joi.number(),
  dueDate: Joi.date(),
  levelType: Joi.string(),
  isLocked: Joi.boolean(),
});