const mongoose = require('mongoose');
const UserSchema = require('./schema');
const { initHooks } = require('./hooks');

initHooks(UserSchema);
UserSchema.index({ organization: 1, employeeId: 1 }, { unique: true });
const User = mongoose.models['user'] ? mongoose.model('user') : mongoose.model('user', UserSchema);

module.exports = User;
