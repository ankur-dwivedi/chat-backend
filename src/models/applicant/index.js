const mongoose = require('mongoose');
const ApplicantSchema = require('./schema');

const Applicant = mongoose.models['applicant']
  ? mongoose.model('applicant')
  : mongoose.model('applicant', ApplicantSchema);

module.exports = Applicant;
