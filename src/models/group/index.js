const mongoose = require('mongoose');
const GroupSchema = require('./schema');

const Group = mongoose.models['group']
  ? mongoose.model('group')
  : mongoose.model('group', GroupSchema);

module.exports = Group;
