const { Schema } = require("mongoose");
const {ROLE_ENUM} = require("./constants");

const UserSchema = new Schema({
  username: { type: String, unique: true },
  employeeId: { type: String},
  phoneNumber: { type: Number},
  email: { type: String, unique: true,required: true },
  name: { type: String, required: true},
  employeeBand: { type: String},
  employeeDepartment: { type: String},
  emloyeeRole: { type: String},
  groups:{ type: [Schema.Types.ObjectId] },
  organization:{ type: Schema.Types.ObjectId },
  role: { type: String, enum:ROLE_ENUM},
  password: { type: String },
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = UserSchema;
