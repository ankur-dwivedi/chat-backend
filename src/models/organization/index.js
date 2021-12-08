const mongoose = require("mongoose");
const OrganizationSchema = require("./schema")

const Organization = mongoose.model("organization", OrganizationSchema);

module.exports = Organization;