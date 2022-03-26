const mongoose = require("mongoose");
const MailingListSchema = require("./schema");

const MailingList = mongoose.models["mailinglist"]
  ? mongoose.model("mailinglist")
  : mongoose.model("mailinglist", MailingListSchema);

module.exports = MailingList;
