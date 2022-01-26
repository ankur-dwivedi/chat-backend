const { Schema } = require("mongoose");

const levelSchema = new Schema({
    creatorUserId: { type: Schema.Types.ObjectId,trim:true , ref: "user",required:true },
    // groupId: {type: Schema.Types.ObjectId,trim:true , ref: "group"},
    templatesId: [{type: Schema.Types.ObjectId,trim:true , ref: "template"}],
    trackId: {type: Schema.Types.ObjectId,trim:true , ref: "track"},
    levelName: {type:String,trim:true,required:true },
    levelDescription: {type:String,trim:true,required:true},
    employeeRetryInDays: {type:Number,trim:true,default:0},
    dueDate: {type:Date,trim:true},
    setTotalTimeForLevel:{type:Boolean,trim:true,default:false},
    totalMinutes:{type:Number,trim:true},
    levelState:{type:String,trim:true,default:"Saved"},  // create enums 
    passingScore:{type:Number,trim:true},
    levelType:{type:String,trim:true,required:true},
    levelTags:{type:Array,trim:true}  // test it afterwards   
},{timestamps:true});

module.exports = levelSchema;
