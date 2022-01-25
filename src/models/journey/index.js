const mongoose = require("mongoose");
const journeySchema = require("./schema")

const Journey = mongoose.model("journey", journeySchema);

module.exports = Journey;