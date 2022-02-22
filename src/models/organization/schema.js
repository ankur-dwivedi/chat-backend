const { Schema } = require("mongoose");

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    domain: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = OrganizationSchema;
