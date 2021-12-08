const { Schema } = require("mongoose");
const { PropertiesSchema } = require("./utils");

const GroupSchema = new Schema({
  name: { type: String, required: true},
  organization: { type: String},
  properties:{type: [PropertiesSchema], required: true},
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = GroupSchema;