const { generateError } = require("../../utils/error");
const mongoose = require("mongoose");
const Track = require(".");

exports.getUsersByTrackId = async (query) =>
  Track.findOne({ _id: mongoose.Types.ObjectId(query.id) })
    .select(["groupId", "trackName"])
    .populate({
      path: "groupId",
      select: "employees",
      populate: { path: "employees", select: ["name", "email"] },
    })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });
