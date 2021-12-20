const { generateError } = require("../../utils/error");
const User = require("./");
const { createGroupFilterQuery } = require("./utils");
const md5 = require("md5");

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
    : query.password && query.employeeId
    ? User.findOne({
        $and: [{ employeeId: query.employeeId }, { password: query.password }],
      })
        .then((response) =>response
            ? response
            : generateError("invalid employeeId or password")
        )
    : User.find()
        .then((response) => response)
        .catch((error) => error);


exports.getGroupEmployee = (organization,property) =>
    User.find({...createGroupFilterQuery(organization,property)})
          .then((response) =>response)
          .catch((error) => error);

exports.create = (userData) =>{
  if(userData?.password)
  userData.password = md5(userData.password)
  return User.create({ ...userData, createdAt: new Date() })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });}

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

exports.addGroupId = (query, groupId) =>
    User.updateMany(query,{ $push: { groups:groupId  } })
      .then((response) => response )

exports.deleteUser = async (id) =>
  User.deleteOne({_id : id })
    .then((response) => (response ? response : null))
    .catch((error) => error);