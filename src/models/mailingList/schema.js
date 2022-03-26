const { Schema } = require("mongoose");

const MailingListSchema = new Schema(
  {
    emailAddress: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = MailingListSchema;
