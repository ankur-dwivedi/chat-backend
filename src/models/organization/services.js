const { generateError } = require("../../utils/error");
const Organization = require("./");

exports.get = async (query) =>
  query.id
    ? Organization.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : query.domain
    ? Organization.findOne({ domain: query.domain })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : Organization.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (organizationData) =>
  Organization.create({ ...organizationData, createdAt: new Date() })
    .then((response) => response)
    .catch((error) => {
      console.error(error);
      return error;
    });

exports.findOrganizations = (query) =>
  Organization.find({ createdBy: query.createdBy })
    .then((response) => response)
    .catch((error) => {
      throw Error(error);
    });

exports.update = (queryObject, updateObject) =>
  Organization.updateOne(queryObject, { $set: updateObject })
    .then((response) => (response && response.n ? response : generateError()))
    .catch((error) => {
      throw Error(error);
    });

exports.deleteOrganization = async (id) =>
  Organization.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
