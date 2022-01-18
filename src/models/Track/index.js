const mongoose = require("mongoose");
const trackSchema = require("./schema")

const Track = mongoose.model("track", trackSchema);

module.exports = Track;