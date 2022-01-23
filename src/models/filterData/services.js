const { generateError } = require("../../utils/error");
const FilterData = require(".");

exports.get = async (query) =>
  query.organization
    ? FilterData.findOne({ _id: query.organization })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : FilterData.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (filterData) =>
  FilterData.create({ ...filterData, createdAt: new Date() })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });

exports.update = (queryObject, updateObject) =>
  FilterData.updateOne(queryObject, { $set: updateObject })
    .then((response) => (response && response.n ? response : generateError()))
    .catch((error) => {
      throw Error(error);
    });

exports.deleteFilterData = async (id) =>
  FilterData.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
