const { generateError } = require("../../utils/error");
const Template = require(".");

exports.get = async (query) =>
  query.id
    ? Template.findOne({ _id: query.id }).then((response) => response)
    : (query.templateOrder || query.templateOrder === 0) && query.levelId
    ? Template.findOne({ templateOrder: query.templateOrder, levelId: query.levelId })
        .select({ answer: false, information: false })
        .then((response) => response)
    : query.levelId
    ? Template.find({ levelId: query.levelId })
        .then((response) => response)
        .catch((error) => error)
    : Template.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (templateData) =>
  Template.create({ ...templateData, createdAt: new Date() }).then((response) => response);

exports.deleteTemplate = async (id) =>
  Template.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);
