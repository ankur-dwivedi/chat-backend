const { Schema } = require("mongoose");
const { LEVEL_STATUS_ENUM } = require("./constants");

const userLevel = new Schema(
  {
    learnerId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    levelId: { type: Schema.Types.ObjectId, trim: true, ref: "level" },
    levelStatus: { type: String, trim: true, enum: LEVEL_STATUS_ENUM },
    levelScore: { type: Number, trim: true, default: 0 },
    totalObtainScore: { type: Number, trim: true, default: 0 },
    totalTemplate: { type: Number, trim: true, default: 0 },
    templateAttempted: { type: Number, trim: true, default: 0 },
    levelOverdue: { type: Boolean, trim: true, default: false },
  },
  { timestamps: true }
);

module.exports = userLevel;
