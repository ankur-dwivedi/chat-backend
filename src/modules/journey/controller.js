const journey_Model = require("../../models/journey/index");

module.exports = {
  get: {},
  post: {
    createJourney: async (req, res) => {
      try {
        let userData = req.user;
        let data = {
          creatorUserId: userData._id,
          groupId:req.body.groupId,
          trackId:req.body.trackId,
          levelId:req.body.levelId,
          submittedAnswer: req.body.submittedAnswer,
          isSubmittedAnswerCorrect:req.body.isSubmittedAnswerCorrect,
          templateId:req.body.templateId,
          timeSpend:req.body.timeSpend,
          anyIssue:req.body.anyIssue,
        };
        let savedData = await journey_Model.create(data);
        return res
          .status(201)
          .json({
            status: "success",
            message: `successfully saved the data in db`,
          });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(200)
          .json({
            status: "failed",
            message: `err.name : ${err.name}, err.message:${err.message}`,
          });
      }
    },
  },
  put: {},
  delete: {},
};
