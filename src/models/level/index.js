const mongoose = require("mongoose");
const levelSchema = require("./schema")

const Level = mongoose.model("level", levelSchema);

module.exports = Level;