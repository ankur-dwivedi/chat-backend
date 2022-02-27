const mongoose = require("mongoose");
const TemplateSchema = require("./schema");

// TemplateSchema.index({ levelId: 1, templateOrder: 1 }, { unique: true });
const Template = mongoose.model("template", TemplateSchema);

module.exports = Template;
