const { Schema } = require("mongoose");
const {
  LEVEL_STATUS_ENUM,
  ATTEMPT_STATUS_ENUM,
  ATTEMPT_STATUS,
  FEEDBACK_TYPE_ENUM,
} = require("./constants");

const feedback = new Schema(
  {
    learnerId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    levelId: { type: Schema.Types.ObjectId, trim: true, ref: "level", required: true },
    templateId: { type: Schema.Types.ObjectId, trim: true, ref: "template", required: true },
    feedback: { type: [{ type: String, trim: true }], required: true },
    feedbackType: { type: String, trim: true, required: true, enum: FEEDBACK_TYPE_ENUM },
  },
  { timestamps: true }
);

module.exports = feedback;
