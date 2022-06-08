const { Schema } = require('mongoose');
const { LEVEL_STATUS_ENUM, ATTEMPT_STATUS_ENUM, ATTEMPT_STATUS } = require('./constants');

const userLevel = new Schema(
  {
    learnerId: { type: Schema.Types.ObjectId, trim: true, ref: 'user', required: true },
    levelId: { type: Schema.Types.ObjectId, trim: true, ref: 'level' },
    levelStatus: { type: String, trim: true, enum: LEVEL_STATUS_ENUM },
    levelScore: { type: Number, trim: true, default: 0 },
    totalObtainScore: { type: Number, trim: true, default: 0 },
    totalTemplate: { type: Number, trim: true, default: 0 },
    templateAttempted: { type: Number, trim: true, default: 0 },
    levelOverdue: { type: Boolean, trim: true, default: false },
    attemptStatus: {
      type: String,
      trim: true,
      default: ATTEMPT_STATUS.ACTIVE,
      enum: ATTEMPT_STATUS_ENUM,
    },
    lastAttemptedTemplate: { type: Schema.Types.ObjectId, trim: true, ref: 'template' },
    dueDateReminder: { type: Number, trim: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = userLevel;
