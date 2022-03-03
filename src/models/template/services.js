const { generateError } = require("../../utils/error");
const Template = require(".");
const { Types } = require("mongoose");

exports.get = async (query) =>
  query.id
    ? Template.findOne({ _id: query.id }).then((response) => response)
    : (query.templateOrder || query.templateOrder === 0) && query.levelId
    ? Template.aggregate()
        .match({
          templateOrder: query.templateOrder,
          levelId: Types.ObjectId(query.levelId),
        })
        .project({
          type: 1,
          levelId: 1,
          trackId: 1,
          levelType: 1,
          organization: 1,
          question: 1,
          options: 1,
          importance: 1,
          templateOrder: 1,
          information: 1,
          revealOption: 1,
          answer: {
            $cond: {
              if: {
                $eq: ["$revealOption", true],
              },
              then: "$answer",
              else: null,
            },
          },
        })
        .exec()
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
