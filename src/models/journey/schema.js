const { Schema } = require('mongoose');
const { TEMPLATE_TYPE_ENUM } = require('../template/constants');
const { LEVEL_TYPE_ENUM } = require('../level/constants');

const journeySchema = new Schema(
  {
    learnerId: { type: Schema.Types.ObjectId, trim: true, ref: 'user', required: true },
    trackId: { type: Schema.Types.ObjectId, trim: true, ref: 'track', required: true },
    levelId: { type: Schema.Types.ObjectId, trim: true, ref: 'level', required: true },
    levelType: { type: String, trim: true, required: true, enum: LEVEL_TYPE_ENUM }, // added to get it in hook
    submittedAnswer: { type: String, trim: true },
    isSubmittedAnswerCorrect: { type: Boolean, trim: true },
    templateId: { type: Schema.Types.ObjectId, trim: true, ref: 'template', required: true },
    templateType: { type: String, enum: TEMPLATE_TYPE_ENUM, required: true }, // added to get it in hook
    timeSpend: { type: Number, trim: true, required: true },
    anyIssue: { type: String, trim: true },
    score: { type: Number, required: true, default: 0 },
    maxScore: { type: Number, required: true, default: 0 },
    attemptId: { type: Schema.Types.ObjectId, trim: true, ref: 'userLevel', required: true },
  },
  { timestamps: true }
);

module.exports = journeySchema;
