const { Schema } = require('mongoose');

const UserSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, trim: true, ref: 'user', required: true },
    receiver: { type: Schema.Types.ObjectId, trim: true, ref: 'user', required: true },
  },
  { timestamps: true }
);

module.exports = UserSchema;
