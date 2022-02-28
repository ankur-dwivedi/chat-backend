const journey_Model = require("../../models/journey/index");
const Template = require("../../models/template/services");
const UserLevel = require("../../models/userLevel/services");
const Journey = require("../../models/journey/services");
const { updateUserState } = require("../template/controller");

//template is first
const checkIfFirstAttempt = async ({ levelId, template }) => {
  const templateOrder = template.templateOrder - 1;
  const nextTemplate = await Template.get({ templateOrder, levelId });
  if (nextTemplate) return false;
  return true;
};

//save journey Data
const saveJourneyData = async ({
  template,
  user,
  groupId,
  submittedAnswer,
  timeSpend,
  anyIssue,
  attemptId,
}) => {
  const data = {
    learnerId: user._id,
    groupId: groupId,
    trackId: template.trackId,
    levelId: template.levelId,
    submittedAnswer: submittedAnswer,
    isSubmittedAnswerCorrect: template.answer.indexOf(submittedAnswer) != -1 ? true : false,
    score: template.answer.indexOf(submittedAnswer) != -1 ? template.importance * 10 : 0,
    maxScore: template.importance * 10,
    templateId: template._id,
    timeSpend,
    anyIssue,
    attemptId,
  };
  const savedData = await journey_Model.create(data);
  return savedData;
};

//save  user current submited  Template
const saveUserCurrentState = async ({ template, userId }) => {
  const updatedUserState = await updateUserState({ id: userId, template });
  return updatedUserState;
};

module.exports = {
  get: {},
  post: {
    createJourney: async (req, res, next) => {
      try {
        const template = req.template;
        const isFirstAttempt = await checkIfFirstAttempt({
          levelId: template.levelId,
          template,
        });
        switch (isFirstAttempt) {
          case true:
            const useLevelData = await UserLevel.create({
              learnerId: req.user._id,
              levelId: template.levelId,
            });
            //save journeyData
            await saveJourneyData({
              template,
              user: req.user,
              groupId: req.body.groupId,
              submittedAnswer: req.body.submittedAnswer,
              timeSpend: req.body.timeSpend,
              anyIssue: req.body.anyIssue,
              attemptId: useLevelData._id,
            });
            break;
          case false:
            //fetch attempt id
            const userLevelData = await UserLevel.getLatestUserLevelByLevel({
              levelId: template.levelId,
            });

            //save journey data
            await saveJourneyData({
              template,
              user: req.user,
              groupId: req.body.groupId,
              submittedAnswer: req.body.submittedAnswer,
              timeSpend: req.body.timeSpend,
              anyIssue: req.body.anyIssue,
              attemptId: userLevelData[0]._id,
            });
            break;
        }
        //update current state of user
        const updatedUserState = await saveUserCurrentState({
          template,
          userId: req.user._id,
        });
        req.user.currentState = updatedUserState.currentState;
        req.query.levelId = String(template.levelId);
        return next();
      } catch (err) {
        console.log(err);
        if (err.message.indexOf("attemptId_1_templateId_1 dup key") !== -1)
          return res.status(400).json({
            status: "failed",
            message: `Template allready submitted in current attempt`,
          });
        return res.status(400).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  put: {},
  delete: {},
  checkIfFirstAttempt,
};
