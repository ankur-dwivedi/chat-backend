const mongoose = require("mongoose");
const userTrackSchema = require("./schema");

const userTrack = mongoose.model("userTrack", userTrackSchema);

module.exports = userTrack;
