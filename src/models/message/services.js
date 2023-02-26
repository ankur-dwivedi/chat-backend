const { generateError } = require('../../utils/error');
const Message = require('./');
const bcrypt = require('bcrypt');

exports.get = async (query) => {
  return Message.find({ $and: [{ sender: query.sender }, { receiver: query.receiver }],}).sort({ createdAt: -1 }).then((response) => (response ? response : generateError('Invalid Message')))

};


exports.create = async (messageData) => {
  return Message.create({ ...messageData}).then((response) => response);
};