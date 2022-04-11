const { Schema } = require("mongoose");
const {trackStateEnums} = require('./constants')

const userTrack = new Schema(
  {
    //here creatorUserId means learnerId 
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    trackId: { type: Schema.Types.ObjectId, trim: true, ref: "track", required: true },
    trackProgress: {type:Number,trim:true},
    trackState: {type:String,trim:true,default:'unattemped',enum:trackStateEnums},
    isArchived: {type:Boolean,trim:true,default:false}
  },
  { timestamps: true }
);

module.exports = userTrack;
