const { Schema } = require("mongoose");

exports.PropertiesSchema = new Schema({
  name: { type: String, required: true},
  value: { type: [String], required: true},
});
