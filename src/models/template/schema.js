const { Schema } = require('mongoose');
const { TEMPLATE_TYPE_ENUM } = require('./constants');
const { QuestionSchema, InformationSchema } = require('./utils');
const { LEVEL_TYPE_ENUM } = require('../level/constants');

const TemplateSchema = new Schema(
  {
    type: { type: String, enum: TEMPLATE_TYPE_ENUM, required: true },
    levelId: { type: Schema.Types.ObjectId, required: true, trim: true, ref: 'level' },
    trackId: { type: Schema.Types.ObjectId, required: true, trim: true, ref: 'track' },
    levelType: { type: String, trim: true, required: true, enum: LEVEL_TYPE_ENUM }, // added to get it in journey hook
    organization: { type: Schema.Types.ObjectId, required: true, trim: true, ref: 'organization' },
    question: { type: QuestionSchema },
    media: { type: QuestionSchema },
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
