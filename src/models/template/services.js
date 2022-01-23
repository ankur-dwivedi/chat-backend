const { generateError } = require("../../utils/error");
const Tempelate = require(".");

exports.get = async (query) =>
  query.id
    ? Tempelate.findOne({ _id: query.id })
        .then((response) => (response ? response : generateError()))
        .catch((error) => error)
    : Tempelate.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (templateData) =>
  Tempelate.create({ ...templateData, createdAt: new Date() })
    .then((response) => response)

exports.deleteTempelate = async (id) =>
  Tempelate.deleteOne({_id : id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
