const { Schema } = require('mongoose');
const { ROLE_ENUM, ROLE } = require('./constants');
const { EmployeeDataSchema, CurrentStateSchema } = require('./utils');
const { OtpSchema } = require('./utils');

const UserSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    phoneNumber: {
      type: Number,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      required: function () {
        return this.email === undefined;
      },
    },
    email: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      required: function () {
        return this.phoneNumber === undefined;
      },
    },
    name: { type: String, required: true },
    employeeData: { type: [EmployeeDataSchema] },
    groups: [{ type: Schema.Types.ObjectId, ref: 'group' }],
    organization: { type: Schema.Types.ObjectId, trim: true, ref: 'organization', required: true },
    role: { type: String, enum: ROLE_ENUM, default: ROLE.CREATOR },
    lastSession: { type: String, enum: ROLE_ENUM, default: ROLE.LEARNER },
    otp: { type: OtpSchema },
    password: { type: String },
    currentState: { type: CurrentStateSchema },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = UserSchema;
