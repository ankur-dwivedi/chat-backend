const { generateError } = require("../../utils/error");
const Level = require(".");

exports.get = async (query) =>
  query.id
    ? Level.findOne({ _id: query.id }).then((response) => response)
    : Level.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (journeyData) =>
  Level.create({ ...journeyData, createdAt: new Date() }).then((response) => response);

exports.deleteLevel = async (id) =>
  Level.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);

exports.update = (queryObject, updateObject) =>
  Level.findOneAndUpdate(queryObject, { $set: updateObject }, { new: true })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });
