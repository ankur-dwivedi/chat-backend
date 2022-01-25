const { Schema } = require("mongoose");
const { PropertiesSchema } = require("./utils");

const FilterDataSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, trim: true, ref: "organization", unique: true },
  data: { type: [PropertiesSchema] },
  createdAt: { type: Date, required: true },
  upatedAt: { type: Date },
});

module.exports = FilterDataSchema;
