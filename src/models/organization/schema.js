const { Schema } = require("mongoose");

const OrganizationSchema = new Schema({
  name: { type: String, required: true},
  logo: { type: String},
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = OrganizationSchema;