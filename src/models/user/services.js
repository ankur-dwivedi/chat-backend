const { generateError } = require("../../utils/error");
const User = require("./");
const { createGroupFilterQuery, createUserIdQuery, createUserIdFindQuery } = require("./utils");
const md5 = require("md5");
const { Types } = require("mongoose");

exports.get = async (query) =>
  query.id
    ? User.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : query.password && query.username
    ? User.findOne({
        $and: [{ username: query.username }, { password: query.password }],
      }).then((response) => (response ? response : generateError("invalid username or password")))
    : query.password && query.employeeId
    ? User.findOne({
        $and: [{ employeeId: query.employeeId }, { password: query.password }],
      }).then((response) => (response ? response : generateError("invalid employeeId or password")))
    : query.employeeId
    ? User.findOne({ employeeId: query.employeeId }).then((response) =>
        response ? response : generateError("invalid employeeId or password")
      )
    : query.username
    ? User.findOne({ username: query.username }).then((response) =>
        response ? response : generateError("invalid employeeId or password")
      )
    : User.find()
        .then((response) => response)
        .catch((error) => error);

exports.getByEmpIdOrName = async (query) =>
  query.employeeId
    ? User.findOne({
        $and: [
          { employeeId: query.employeeId },
          { organization: Types.ObjectId(query.organization) },
        ],
      }).then((response) => (response ? response : generateError()))
    : User.findOne({
        $and: [{ employeeId: query.name }, { organization: Types.ObjectId(query.organization) }],
      }).then((response) => (response ? response : generateError()));

exports.getGroupEmployee = (organization, property) =>
  User.find({ ...createGroupFilterQuery(organization, property) })
    .sort({ createdAt: -1 })
    .then((response) => response)
    .catch((error) => error);

exports.getOrgEmployee = ({ organization }) =>
  User.find({ organization: Types.ObjectId(organization) })
    .sort({ createdAt: -1 })
    .then((response) => response)
    .catch((error) => error);

exports.create = (userData) => {
  if (userData && userData.password) userData.password = md5(userData.password);
  return User.create({ ...userData, createdAt: new Date() })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });
};

exports.findUsers = (query) =>
  User.find({ createdBy: query.createdBy })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });

exports.update = (queryObject, updateObject) =>
  User.findOneAndUpdate(queryObject, { $set: updateObject }, { new: true })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });

exports.addGroupId = (query, groupId) =>
  User.updateMany(query, { $push: { groups: groupId } }).then((response) => response);

exports.deleteUser = async (id) =>
  User.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);

exports.updateUserByIds = (org, employeeIds, groupId) =>
  User.updateMany(createUserIdQuery(org, employeeIds), {
    $push: { groups: groupId },
  }).then((response) => response);

exports.findIdByEmloyeeId = (employeeIds, org) =>
  User.find({ ...createUserIdFindQuery(employeeIds, org) })
    .then((user) => {
      return user.map((value) => value._id);
    })
    .catch((err) => false);
