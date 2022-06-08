const { generateError } = require('../../utils/error');
const UserLevel = require('.');

exports.get = async (query) =>
  query.id
    ? UserLevel.findOne({ _id: query.id }).then((response) => response)
    : query.levelId && query.attemptStatus && query.learnerId
    ? UserLevel.findOne({
        levelId: query.levelId,
        attemptStatus: query.attemptStatus,
        learnerId: query.learnerId,
      }).then((response) => response)
    : UserLevel.find()
        .then((response) => response)
        .catch((error) => error);

exports.getLatestUserLevelByLevel = async ({ levelId, learnerId }) =>
  UserLevel.find({ levelId, learnerId })
    .sort({ createdAt: -1 })
    .then((response) => response);

exports.create = (userLevelData) =>
  UserLevel.create({ ...userLevelData, createdAt: new Date() }).then((response) => response);

exports.deleteUserLevel = async (id) =>
  UserLevel.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);

exports.update = (queryObject, updateObject) =>
  UserLevel.updateOne(queryObject, { $set: updateObject })
    .then((response) => (response && response.n ? response : generateError()))
    .catch((error) => {
      throw Error(error);
    });
