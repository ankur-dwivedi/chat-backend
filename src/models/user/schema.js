const { Schema } = require('mongoose');

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    name: { type: String, required: true },
    password: { type: String },
  },
  { timestamps: true }
);

module.exports = UserSchema;
