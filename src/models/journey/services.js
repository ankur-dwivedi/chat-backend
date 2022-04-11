const { generateError } = require("../../utils/error");
const Journey = require(".");

exports.get = async (query) =>
  query.id
    ? Journey.findOne({ _id: query.id }).then((response) => response)
    : query.attemptId && query.templateId
    ? Journey.findOne({ attemptId: query.attemptId, templateId: query.templateId })
        .then((response) => response)
        .catch((error) => error)
    : query.attemptId
    ? Journey.find({ attemptId: query.attemptId })
        .then((response) => response)
        .catch((error) => error)
    : Journey.find()
        .then((response) => response)
        .catch((error) => error);

exports.create = (journeyData) =>
  Journey.create({ ...journeyData, createdAt: new Date() }).then((response) => response);

exports.deleteJourney = async (id) =>
  Journey.deleteOne({ _id: id })
    .then((response) => (response ? response : null))
    .catch((error) => error);

exports.getTemplateByAttemptId = ({ levelId, templateId, attemptId }) =>
  Journey.findOne({ levelId, templateId, attemptId }).then((response) => response);