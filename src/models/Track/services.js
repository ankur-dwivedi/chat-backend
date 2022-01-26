const { generateError } = require("../../utils/error");
const Group = require("../../models/Group/index");
const mongoose = require("mongoose");
const trackSchema = require("./schema")
const Track = require(".")



exports.getUsersByTrackId = async(query) => 
  Track.findOne({_id:mongoose.Types.ObjectId(query.id)}).select(['groupId','trackName']).populate({path:'groupId', select: 'employees', populate:{path:'employees',select:['name','email']}})
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });