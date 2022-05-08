const journey_Model = require("../../models/journey/index");
const Template = require("../../models/template/services");
const UserLevel = require("../../models/userLevel/services");
const User = require("../../models/user/services");
const { updateUserState } = require("../template/controller");
const { TEMPLATE_TYPE } = require("../../models/template/constants");
const { LEVEL_TYPE } = require("../../models/level/constants");
const { ATTEMPT_STATUS } = require("../../models/userLevel/constants");
const { Types } = require("mongoose");

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
  submittedAnswer,
  timeSpend,
  anyIssue,
  attemptId,
}) => {
  const data = {
    learnerId: user._id,
    trackId: template.trackId,
    levelId: template.levelId,
    submittedAnswer: submittedAnswer,
    templateId: template._id,
    timeSpend,
    anyIssue,
    attemptId,
    templateType: template.type,
    levelType: template.levelType,
  };
  if (
    template.levelType === LEVEL_TYPE.ASSESMENT &&
    (template.type === TEMPLATE_TYPE.MCQ_TEXT || template.type === TEMPLATE_TYPE.MCQ_MEDIA)
  ) {
    data["isSubmittedAnswerCorrect"] =
      template.answer.indexOf(submittedAnswer) != -1 ? true : false;
    data["score"] = template.answer.indexOf(submittedAnswer) != -1 ? template.importance * 10 : 0;
    data["maxScore"] = template.importance * 10;
  }
  let savedData = await journey_Model.create(data);
  if (
    template.levelType !== LEVEL_TYPE.ASSESMENT &&
    (template.type === TEMPLATE_TYPE.MCQ_TEXT || template.type === TEMPLATE_TYPE.MCQ_MEDIA)
  )
    savedData = {
      isSubmittedAnswerCorrect: template.answer.indexOf(submittedAnswer) != -1 ? true : false,
    };
  return savedData;
};

//save  user current submited  Template
const saveUserCurrentState = async ({ template, userId,timeSpend }) => {
  const updatedUserState = await updateUserState({ id: userId, template,timeSpend });
  return updatedUserState;
};

module.exports = {
  get: {},
  post: {
    createJourney: async (req, res, next) => {
      try {
        const template = req.template;

        // check if active attempt exists
        const userLevelData = await UserLevel.get({
          levelId: template.levelId,
          attemptStatus: ATTEMPT_STATUS.ACTIVE,
          learnerId: req.user._id,
        });
        let saveData;
        if (userLevelData) {
          //save journey data
          saveData = await saveJourneyData({
            template,
            user: req.user,
            submittedAnswer: req.body.submittedAnswer,
            timeSpend: req.body.timeSpend,
            anyIssue: req.body.anyIssue,
            attemptId: userLevelData._id,
          });
        } else {
          const useLevelData = await UserLevel.create({
            learnerId: req.user._id,
            levelId: template.levelId,
          });
          //save journeyData
          saveData = await saveJourneyData({
            template,
            user: req.user,
            submittedAnswer: req.body.submittedAnswer,
            timeSpend: req.body.timeSpend,
            anyIssue: req.body.anyIssue,
            attemptId: useLevelData._id,
          });
        }

        //update current state of user
        const updatedUserState = await saveUserCurrentState({
          template,
          userId: req.user._id,
          timeSpend: req.user.currentState?.timeSpend && !req.user.currentState?.completed?req.user.currentState.timeSpend+req.body.timeSpend:req.body.timeSpend
        });
        if (template.levelType !== LEVEL_TYPE.ASSESMENT) {
          if (template.type === TEMPLATE_TYPE.MCQ_TEXT || template.type === TEMPLATE_TYPE.MCQ_MEDIA)
            return res.json({ ...saveData });
          else return res.json({ message: `Template submitted successfully` });
        } else {
          if (template.information && template.type !== TEMPLATE_TYPE.DOC) {
            return res.json({
              answerExplainer: template.information,
            });
          } else {
            req.user.currentState = updatedUserState.currentState;
            req.query.levelId = String(template.levelId);
            return next();
          }
        }
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
    closeAttempt: async (req, res, next) => {
      try {
        const userLevelData = await UserLevel.get({
          levelId: req.body.levelId,
          attemptStatus: ATTEMPT_STATUS.ACTIVE,
          learnerId: req.user._id,
        });
        if (userLevelData) {
          await UserLevel.update(
            { _id: userLevelData._id },
            { attemptStatus: ATTEMPT_STATUS.CLOSED }
          );
          await User.update(
            { _id: Types.ObjectId(req.user._id) },
            {
              currentState: null,
            }
          );
          return res.json({
            message: `Attempt closed successfully`,
          });
        } else
          return res.status(400).json({
            status: "failed",
            message: `Level doesn't contain any active attempt`,
          });
      } catch (err) {
        console.log(err);
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
