const mongoose = require("mongoose");
const userLevelOverdueSchema = require("./schema")

const userLevelOverdue = mongoose.model("userLevelOverdue", userLevelOverdueSchema);

module.exports = userLevelOverdue;