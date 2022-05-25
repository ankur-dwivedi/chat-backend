const { Schema } = require("mongoose");
const { booleanEnum }=require('./constants');

const trackSchema = new Schema(
  {
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    trackName: { type: String, trim: true, required: true },
    groupId: { type: [Schema.Types.ObjectId], trim: true, ref: "group" },
    description: { type: String, trim: true, required: true },
    selectedTheme: { type: String, trim: true, required: true },
    skillTag: { type: Array, trim: true },
    organization: { type: Schema.Types.ObjectId, required: true, trim: true, ref: "organization" },
    botGeneratedGroup:{type:Boolean,trim:true,enum:booleanEnum}
  },
  { timestamps: true }
);

module.exports = trackSchema;
