const { Schema } = require("mongoose");
const {
  LEVEL_TYPE_ENUM,
  LEVEL_STATE_ENUM,
  LEVEL_STATE,
} = require("./constants");

const levelSchema = new Schema(
  {
    creatorUserId: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "user",
      required: true,
    },
    trackId: { type: Schema.Types.ObjectId, trim: true, ref: "track" },
    levelName: { type: String, trim: true, required: true },
    levelDescription: { type: String, trim: true, required: true },
    levelState: {
      type: String,
      trim: true,
      enum: LEVEL_STATE_ENUM,
      default: LEVEL_STATE.INPROGRESS,
    },
    passingScore: { type: Number, trim: true },
    employeeRetryInDays: { type: Number, trim: true, default: 0 },
    totalMinutes: { type: Number, trim: true },
    dueDate: { type: Date, trim: true },
    levelType: {
      type: String,
      trim: true,
      required: true,
      enum: LEVEL_TYPE_ENUM,
    },
    organization: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "organization",
    },
    isLocked: { type: Boolean, default: false },
    allowReattempt: { type: Boolean, default: false }, // for assesment type
  },
  { timestamps: true }
);

module.exports = levelSchema;
