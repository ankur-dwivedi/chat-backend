const mongoose = require("mongoose");
const groupSchema = require("./schema")

const Group = mongoose.model("groups", groupSchema);

module.exports = Group;