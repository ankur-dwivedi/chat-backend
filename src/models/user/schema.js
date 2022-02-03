const { Schema } = require("mongoose");
const { ROLE_ENUM, ROLE } = require("./constants");
const { EmployeeDataSchema, CurrentStateSchema } = require("./utils");
const { OtpSchema } = require("./utils");

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  employeeId: { type: String, unique: true, required: true },
  phoneNumber: { type: Number, unique: true, required: true },
  email: { type: String },
  name: { type: String, required: true },
  employeeData: { type: [EmployeeDataSchema] },
  groups: [{ type: Schema.Types.ObjectId, ref: "group" }],
  organization: { type: Schema.Types.ObjectId, trim: true, ref: "organization", required: true },
  role: { type: String, enum: ROLE_ENUM, default: ROLE.ADMIN },
  lastRole: { type: String, enum: ROLE_ENUM, default: ROLE.LEARNER },
  otp: { type: OtpSchema },
  password: { type: String },
  currentState: { type: CurrentStateSchema },
  createdAt: { type: Date, required: true },
  upatedAt: { type: Date },
});

module.exports = UserSchema;
