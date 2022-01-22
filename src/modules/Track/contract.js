const Joi = require("joi");


exports.createTrackContract = Joi.object({
    trackName:Joi.string().required(),
    groupName:Joi.string().required(),
    selectedTheme:Joi.string().required(),
    skillTag:Joi.array()
})
