const Joi = require("joi");


exports.createGroupsContract = Joi.object({
    groupName:Joi.string().required(),
    groupDescription:Joi.string().required(),
})
