const Joi = require("joi");


exports.createUserTrackInfoContract = Joi.object({
    isArchived:Joi.boolean().required(),
    trackId:Joi.string().required()
})

exports.updateUserTrackInfoContract = Joi.object({
    isArchived:Joi.boolean().required(),
})