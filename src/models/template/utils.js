const { Schema } = require("mongoose");
const { MediaTypeEnum } = require("./constants");

exports.QuestionSchema = new Schema({
  value: { type: String },
  type: { type: String, enum: MediaTypeEnum },
});

exports.InformationSchema = new Schema({
  text: { type: String },
  media: { type: String },
  mediaType: { type: String, enum: MediaTypeEnum },
});
