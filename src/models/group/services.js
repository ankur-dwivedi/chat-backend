const { generateError } = require("../../utils/error");
const Group = require(".");

exports.get = async (query) =>
  query.createdBy
    ? Group.find({ $and: [({ createdBy: query.createdBy }, { botGeneratedGroup: false })] }, "")
        .select(["_id", "name", "description"])
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : query.id
    ? Group.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : Group.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (groupData) =>
  Group.create({ ...groupData, createdAt: new Date() })``
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });

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
