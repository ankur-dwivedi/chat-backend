const mongoose = require('mongoose');
const MessageSchema = require('./schema');

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;
