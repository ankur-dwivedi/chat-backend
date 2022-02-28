const { Schema } = require("mongoose");
const { TEMPLATE_TYPE_ENUM } = require("./constants");
const { QuestionSchema, InformationSchema } = require("./utils");

const TemplateSchema = new Schema(
  {
    type: { type: String, enum: TEMPLATE_TYPE_ENUM, required: true },
    levelId: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "level" },
    trackId: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "track" },
    organization: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "organization" },
    question: { type: QuestionSchema },
    options: { type: [QuestionSchema] },
    answer: { type: [String] },
    importance: { type: Number },
    templateOrder: { type: Number, required: true },
    information: { type: InformationSchema },
    revealOption: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = TemplateSchema;
