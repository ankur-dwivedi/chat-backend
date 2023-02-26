const { generateError } = require('../../utils/error');
const User = require('./');
const bcrypt = require('bcrypt');

exports.get = async (query) => {
  return  query?.email 
    ? User.findOne({email:query.email}).then((response) => (response ? response : generateError('Invalid User')))
    : User.find()
      .select({name:1,email:1})
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
    return match;
  } catch (err) {
    return { errName: err.name, errMessage: err.message };
  }
};