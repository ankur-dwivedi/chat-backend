const mongoose = require('mongoose');
const userLevelSchema = require('./schema');

const userLevel = mongoose.model('userLevel', userLevelSchema);

module.exports = userLevel;
