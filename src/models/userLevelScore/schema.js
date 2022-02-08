const { Schema } = require("mongoose");

const levelSchema = new Schema(
  {
    creatorUserId: { type: Schema.Types.ObjectId, trim: true, ref: "user", required: true },
    levelId: [{ type: Schema.Types.ObjectId, trim: true, ref: "level" }],
    levelStatus:{type:String,trim:true},
    levelScore:{type:Number,trim:true},
    levelOverdue:{type:Boolean,trim:true,default:false}
  },
  { timestamps: true }
);

module.exports = levelSchema;
