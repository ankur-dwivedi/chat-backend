const { Schema } = require("mongoose");
const { selectedTheme } = require("../../utils/constants");

const trackSchema = new Schema(
  {
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    trackName: { type: String, trim: true, required: true },
    groupId: { type: Schema.Types.ObjectId, trim: true, ref: "group" },
    description: { type: String, trim: true, required: true },
    selectedTheme: { type: String, trim: true, required: true, enum: selectedTheme },
    skillTag: { type: Array, trim: true },
    organization: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "organization" },
  },
  { timestamps: true }
);

module.exports = trackSchema;
