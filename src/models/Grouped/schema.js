const { Schema } = require("mongoose");

const groupSchema = new Schema({
    userId: { type: Schema.Types.ObjectId,trim:true , ref: "user",required:true },
    groupName:{type:String,trim:true,required:true },
    groupDescription:{type:String,trim:true,required:true },
},{timestamps:true});

module.exports = groupSchema;
