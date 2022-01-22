const { Schema } = require("mongoose");
const { MediaTypeEnum } = require("./constants");

exports.QuestionSchema = new Schema({
  value: { type: String, required: true},
  type: { type: String, enum: MediaTypeEnum, required: true}
});

exports.InformationSchema = new Schema({
  text: { type: String},
  media:{type:String},
  mediaType: { type: String, enum: MediaTypeEnum}
});
