const Joi = require("joi");


exports.createLevelContract = Joi.object({
    groupId: Joi.string().required(),
    trackId: Joi.string().required(),
    levelName: Joi.string().required(),
    levelDescription: Joi.string().required(),
    employeeRetryInDays: Joi.number().required(),
    dueDate: Joi.number(),
})
