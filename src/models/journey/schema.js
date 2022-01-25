const { Schema } = require("mongoose");

const journeySchema = new Schema({
    creatorUserId:{type:Schema.Types.ObjectId,trim:true,ref:"user",required:true},
    groupId:{type:Schema.Types.ObjectId,trim:true,ref:"group",required:true},
    trackId:{type:Schema.Types.ObjectId,trim:true,ref:"track",required:true},
    levelId:{type:Schema.Types.ObjectId,trim:true,ref:"level",required:true},
    submittedAnswer:{type:String,trim:true,required:true},
    isSubmittedAnswerCorrect:{type:Boolean,trim:true,required:true},
    templateId:{type:Schema.Types.ObjectId,trim:true,ref:"template",required:true},
    timeSpend:{type:Number,trim:true,required:true},
    anyIssue:{type:String,trim:true},
},{timestamps:true});

module.exports = journeySchema;
