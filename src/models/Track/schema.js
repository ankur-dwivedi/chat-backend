const { Schema } = require("mongoose");

const trackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId,trim:true , ref: "user",required:true },
    trackName:{type:String,trim:true,required:true },
    groupId:{type: Schema.Types.ObjectId,trim:true , ref: "groups"},
    groupName:{type:String,trim:true,required:true },
    selectedTheme:{type:String,trim:true,required:true},
    trackColor1:{type:String,trim:true,required:true},
    trackColor2:{type:String,trim:true,required:true},
},{timestamps:true});

module.exports = trackSchema;
