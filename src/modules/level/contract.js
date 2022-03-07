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
});
