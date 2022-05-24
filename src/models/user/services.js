const { generateError } = require("../../utils/error");
const User = require("./");
const {
  createGroupFilterQuery,
  createUserIdQuery,
  createUserIdFindQuery,
} = require("./utils");
const md5 = require("md5");
const { Types } = require("mongoose");
const bcrypt = require("bcrypt");
const { truncate } = require("lodash");

exports.get = async (query) => {
  console.log(query);
  return query.id
    ? User.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : query.password && query.employeeId && query.organization
    ? User.findOne(
        {
          $and: [
            { employeeId: query.employeeId },
            { organization: query.organization },
          ],
        },
        { otp: 0, __v: 0 }
      )
        .lean()
        .then((response) =>
          response ? response : generateError("invalid employeeId or password")
        )
    : query.employeeId && query.organization
    ? User.findOne({
        $and: [
          { employeeId: query.employeeId },
          { organization: query.organization },
          { __v: 0 },
        ],
      }).then((response) =>
        response ? response : generateError("Invalid Employee ID")
      )
    : User.find()
        .then((response) => response)
        .catch((error) => error);
};

exports.getEmpByOrg = ({ organization }) =>
  User.find({ organization }).then((response) =>
    response ? response : generateError("Invalid Employee ID")
  );

//function to compare and check/validate password
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

exports.getEmpBempIdOrg = async (query) =>
  User.findOne({
    $and: [
      { employeeId: query.employeeId },
      { organization: query.organization },
    ],
  }).then((response) => response);

exports.getUserAnalytics = async (query) =>
  User.findOne({ _id: query.id })
    .populate({
      path: "groups",
      select: "name",
    })
    .then((response) => (response ? response : generateError()))
    .catch((error) => error);

exports.getUserAndOrgByEmpId = ({ employeeId, organization }) =>
  User.findOne({ employeeId, organization })
    .populate({
      path: "organization",
      select: "domain",
    })
    .then((response) =>
      response ? response : generateError("Invalid Employee ID")
    );

exports.getUserWithOrg = ({ userId }) =>
  User.findById(userId)
    .populate({
      path: "organization",
      select: "logo name",
    })
    .select([
      "role",
      "lastSession",
      "_id",
      "name",
      "email",
      "employeeId",
      "phoneNumber",
      "organization",
    ])
    .then((user) => user);

exports.searchByEmp = (query) =>
  User.find({
    $and: [
      {
        $or: [
          {
            $and: [
              {
                employeeId: { $regex: query.employeeId + ".*", $options: "i" },
              },
              { organization: query.organization },
            ],
          },
          {
            $and: [
              { name: { $regex: query.employeeId + ".*", $options: "i" } },
              { organization: query.organization },
            ],
          },
        ],
      },
      { organization: query.organization },
    ],
  })
    .select(["employeeId", "name"])
    .limit(10)
    .then((response) => response);

exports.getGroupEmployee = (organization, property) =>
  User.find({ ...createGroupFilterQuery(organization, property) })
    .select(["_id", "name", "email", "employeeData"])
    .sort({ createdAt: -1 })
    .then((response) => response)
    .catch((error) => error);

exports.getOrgEmployee = ({ organization }) =>
  User.find({ organization: Types.ObjectId(organization) })
    .select(["_id", "name", "email"])
    .sort({ createdAt: -1 })
    .then((response) => response)
    .catch((error) => error);

exports.create = async (userData) => {
  if (userData && userData.password)
    userData.password = await bcrypt.hash(userData.password, 10);
  return User.create({ ...userData, createdAt: new Date() }).then(
    (response) => response
  );
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
  User.updateMany(query, { $push: { groups: groupId } });

exports.deleteUser = async (id) =>
  User.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);

exports.deleteUsers = async (userIdArray) => {
  return User.deleteMany({ _id: { $in: userIdArray } })
    .then((response) => {
      console.log(response);
      return response ? response : null;
    })
    .catch((error) => error);
};

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

exports.removeGroupId = ({ groupId }) =>
  User.updateMany(
    { groups: { $in: [groupId] } },
    {
      $pull: {
        groups: groupId,
      },
    }
  );

exports.removeGroupIdByEmpId = ({ groupId, employeeId }) =>
  User.updateMany(
    { _id: { $in: employeeId } },
    {
      $pull: {
        groups: groupId,
      },
    }
  );

exports.countEmployeeInOrg = ({ organization }) => {
  User.find({ organization })
    .count()
    .then((response) => {
      console.log(response);
      return response;
    });
  return User.find({ organization })
    .count()
    .then((response) => response);
};

exports.findPaginatedUsers = async ({ limit, skipIndex, query }) =>
  User.aggregate([
    { $match: query },
    {
      $facet: {
        totalCount: [{ $count: "totalCount" }],
        data: [{ $sort: { _id: 1 } }, { $skip: skipIndex }, { $limit: limit }],
      },
    },
  ])
    .then((response) => response)
    .catch((error) => error);
