const mongoose = require("mongoose");
const trackSchema = require("./schema")

const Track = mongoose.model("tracks", trackSchema);

module.exports = Track;