const mongoose = require('mongoose');
const UserSchema = require('./schema');

const User = mongoose.model('user', UserSchema);

module.exports = User;
