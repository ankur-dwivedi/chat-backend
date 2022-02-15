const mongoose = require("mongoose");
const journeySchema = require("./schema");
const { initHooks } = require("./hooks");

initHooks(journeySchema);
const Journey = mongoose.model("journey", journeySchema);

module.exports = Journey;
