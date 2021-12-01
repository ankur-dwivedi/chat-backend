const { generateError } = require("../../utils/error");
const User = require("./");

exports.get = async (query) =>
  query.id
    ? User.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : query.password && query.username
    ? User.findOne({
        $and: [{ username: query.username }, { password: query.password }],
      })
        .then((response) =>response
            ? response
            : generateError("invalid username or password")
        )
    : User.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (userData) =>
  User.create({ ...userData, createdAt: new Date() })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });

exports.findUsers = (query) =>
  User.find({ createdBy: query.createdBy })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });

exports.update = (queryObject, updateObject) =>
  User.updateOne(queryObject, { $set: updateObject })
    .then((response) => (response && response.n ? response : generateError()))
    .catch((error) => {
      throw Error(error);
    });

exports.deleteUser = async (id) =>
  User.deleteOne({_id : id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
