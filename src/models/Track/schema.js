const { Schema } = require("mongoose");

const trackSchema = new Schema(
  {
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    trackName: { type: String, trim: true, required: true },
    groupId: { type: Schema.Types.ObjectId, trim: true, ref: "group" },
    groupName: { type: String, trim: true, required: true },
    selectedTheme: { type: String, trim: true, required: true },
    trackColorFill: { type: String, trim: true, required: true },
    trackColorBorder: { type: String, trim: true, required: true },
    skillTag: { type: Array, trim: true }, // test it once
    organization: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "organization" },
  },
  { timestamps: true }
);

module.exports = trackSchema;
