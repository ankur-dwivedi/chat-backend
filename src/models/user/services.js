const { generateError } = require('../../utils/error');
const User = require('./');
const bcrypt = require('bcrypt');

exports.get = async (query) => {
  return query.id
    ? User.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
: query.email 
    ? User.findOne({email:query.email}).then((response) => (response ? response : generateError('Invalid User')))
    : User.find()
        .then((response) => response)
        .catch((error) => error);
};


exports.create = async (userData) => {
  if (userData && userData.password) userData.password = await bcrypt.hash(userData.password, 10);
  return User.create({ ...userData}).then((response) => response);
};

exports.passwordCompare = async (password, storedPassword) => {
  try {
    let match = await bcrypt.compare(password, storedPassword);
    console.log(match);
    return match;
  } catch (err) {
    console.log(err.name);
    console.log(err.message);
    return { errName: err.name, errMessage: err.message };
  }
};