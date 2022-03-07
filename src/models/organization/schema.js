const { Schema } = require("mongoose");
const { REVENUE_SCHEME_ENUM } = require("./constants");

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    domain: { type: String, required: true, unique: true },
    revenueScheme: { type: String, trim: true, enum: REVENUE_SCHEME_ENUM },
  },
  { timestamps: true }
);

module.exports = OrganizationSchema;
