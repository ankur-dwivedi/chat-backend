const mongoose = require("mongoose");
const ApplicantSchema = require("./schema");

const Applicant = mongoose.models["applicants"]
  ? mongoose.model("applicants")
  : mongoose.model("applicants", ApplicantSchema);

module.exports = Applicant;
