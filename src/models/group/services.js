const { generateError } = require("../../utils/error");
const Group = require(".");

exports.get = async (query) =>
  query.createdBy
    ? Group.aggregate()
        .match({ $and: [({ createdBy: query.createdBy }, { botGeneratedGroup: false })] })
        .project({
          _id: 1,
          name: 1,
          description: 1,
          employees: { $size: "$employees" },
        })
    : query.id
    ? Group.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : Group.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (groupData) =>
  Group.create({ ...groupData, createdAt: new Date() }).then((response) => response);

exports.findGroups = (query) =>
  Group.find({ createdBy: query.createdBy })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });

exports.update = (queryObject, updateObject) =>
  Group.updateOne(queryObject, { $set: updateObject })
    .then((response) => (response && response.n ? response : generateError()))
    .catch((error) => {
      throw Error(error);
    });

exports.deleteGroup = async (id) =>
  Group.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
