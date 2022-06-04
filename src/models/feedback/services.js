const { generateError } = require('../../utils/error');
const UserLevel = require('.');

exports.get = async (query) =>
  query.id
    ? UserLevel.findOne({ _id: query.id }).then((response) => response)
    : UserLevel.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (feedbackData) =>
  UserLevel.create({ ...feedbackData }).then((response) => response);
