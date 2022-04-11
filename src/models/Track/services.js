const { generateError } = require("../../utils/error");
const mongoose = require("mongoose");
const Track = require(".");

exports.get = async (query) =>
  Track.findOne({ _id: query.id })
    .then((response) => (response ? response : generateError()))
    .catch((error) => error);

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

exports.removeTrackGroupId = ({ groupId }) =>
  Track.updateMany(
    { groupId: { $in: [groupId] } },
    {
      $pull: {
        groupId: groupId,
      },
    }
  );
