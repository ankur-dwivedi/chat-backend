const { Schema } = require("mongoose");
const {ROLE_ENUM} = require("./constants");
const { EmployeeDataSchema } = require("./utils");

const UserSchema = new Schema({
  username: { type: String, unique: true,required: true },
  employeeId: { type: String, unique: true,required: true },
  phoneNumber: { type: Number, unique: true,required: true },
  email: { type: String, unique: true,required: true },
  name: { type: String, required: true},
  employeeData:{type: [EmployeeDataSchema]},
  groups:{ type: [Schema.Types.ObjectId] },
  organization:{ type: Schema.Types.ObjectId },
  role: { type: String, enum:ROLE_ENUM},
  password: { type: String },
  createdAt: { type: Date,required: true },
  upatedAt: { type: Date },
});

module.exports = UserSchema;
