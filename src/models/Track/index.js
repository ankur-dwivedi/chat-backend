const mongoose = require("mongoose");
const trackSchema = require("./schema")

const Track = mongoose.models["track"]
? mongoose.model("track") 
: mongoose.model("track", trackSchema)

module.exports = Track;