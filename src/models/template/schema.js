const { Schema } = require("mongoose");
const { TemplateType } = require("./constants");
const { QuestionSchema, InformationSchema } = require("./utils");

const TemplateSchema = new Schema({
  type: { type: String, enum:TemplateType, required: true},
  levelId:{ type: Schema.Types.ObjectId, required: true },
  trackId:{ type: Schema.Types.ObjectId, required: true },
  organization:{ type: Schema.Types.ObjectId, required: true },
  question: { type: QuestionSchema },
  options: { type: [QuestionSchema] },
  answer: { type: [String]},
  importance:{type:Number},
  information:{type:InformationSchema},
  revealOption:{type:Boolean},
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = TemplateSchema;