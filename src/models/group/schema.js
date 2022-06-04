const { Schema } = require('mongoose');
const { PropertiesSchema } = require('./utils');

const GroupSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    employees: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    organization: { type: Schema.Types.ObjectId, trim: true, ref: 'organization' },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    properties: { type: [PropertiesSchema] },
    botGeneratedGroup: { type: Boolean, trim: true, default: false },
  },
  { timestamps: true }
);

module.exports = GroupSchema;
