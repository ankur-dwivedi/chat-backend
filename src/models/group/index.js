const mongoose = require("mongoose");
const GroupSchema = require("./schema")

const Group = mongoose.model("group", GroupSchema);

module.exports = Group;