const { Schema } = require("mongoose");
const { PropertiesSchema } = require("./utils");

const GroupSchema = new Schema({
  name: { type: String, required: true},
  employees:{ type: [Schema.Types.ObjectId] },
  organization:{ type: Schema.Types.ObjectId },
  properties:{type: [PropertiesSchema], required: true},
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = GroupSchema;