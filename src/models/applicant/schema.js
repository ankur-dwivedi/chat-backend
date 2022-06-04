const { Schema } = require('mongoose');

const ApplicantSchema = new Schema(
  {
    name: { type: String, required: true, unique: false },
    emailAddress: { type: String, required: true, unique: false },
    linkedin: { type: String, required: true, unique: false },
    otherLink: { type: String, required: true, unique: false },
    resume: { type: String, required: true, unique: false },
    jobId: { type: String, required: true, unique: false },
    jobTitle: { type: String, required: true, unique: false },
  },
  { timestamps: true }
);

ApplicantSchema.index({ emailAddress: 1, jobId: 1 }, { unique: true });

module.exports = ApplicantSchema;
