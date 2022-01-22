const mongoose = require("mongoose");
const TemplateSchema = require("./schema")

const Template = mongoose.model("template", TemplateSchema);

module.exports = Template;