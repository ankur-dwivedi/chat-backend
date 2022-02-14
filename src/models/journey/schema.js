const { Schema } = require("mongoose");

const journeySchema = new Schema(
  {
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    groupId: { type: Schema.Types.ObjectId, trim: true, ref: "group", required: true },
    trackId: { type: Schema.Types.ObjectId, trim: true, ref: "track", required: true },
    levelId: { type: Schema.Types.ObjectId, trim: true, ref: "level", required: true },
    submittedAnswer: { type: String, trim: true },
    isSubmittedAnswerCorrect: { type: Boolean, trim: true },
    templateId: { type: Schema.Types.ObjectId, trim: true, ref: "template", required: true },
    timeSpend: { type: Number, trim: true, required: true },
    anyIssue: { type: String, trim: true },
    score: { type: Number, required: true, default: 0 },
    attemptId: { type: Schema.Types.ObjectId, trim: true, ref: "userLevel", required: true },
  },
  { timestamps: true }
);

module.exports = journeySchema;
