const Template = require("../template/services");
const UserLevel = require("../userLevel/services");
const Level = require("../level/services");
const { LEVEL_STATUS, ATTEMPT_STATUS } = require("../userLevel/constants");
const { TEMPLATE_TYPE } = require("../template/constants");
const { LEVEL_TYPE } = require("../level/constants");
const { updateTrackStatus } = require("../userTrack/services");

exports.initHooks = (JourneySchema) => {
  JourneySchema.post("save", async (docs) => {
    const { attemptId, levelId, templateType, levelType, templateId } = docs;
    if (
      levelType === LEVEL_TYPE.ASSESMENT &&
      (templateType === TEMPLATE_TYPE.MCQ_TEXT || templateType === TEMPLATE_TYPE.MCQ_MEDIA)
    ) {
      //calculate percentage score
      const templateData = await Template.get({ levelId });
      const userLevelData = await UserLevel.get({ id: attemptId });
      const maxScore = templateData.reduce(
        (total, value) =>
          value.importance &&
          (value.type === TEMPLATE_TYPE.MCQ_TEXT || value.type === TEMPLATE_TYPE.MCQ_MEDIA)
            ? total + value.importance * 10
            : total,
        0
      );
      const percentageScore =
        ((userLevelData.totalObtainScore
          ? userLevelData.totalObtainScore + docs.score
          : docs.score) /
          maxScore) *
        100;
      //get level passing score
      const levelData = await Level.get({ id: levelId });
      let passStatus = {};
      if (levelData.passingScore && templateData.length === userLevelData.templateAttempted + 1)
        passStatus["levelStatus"] =
          levelData.passingScore <= percentageScore ? LEVEL_STATUS.PASS : LEVEL_STATUS.FAIL;
      //update score in userLevel
      console.log({ templateData, userLevelData, percentageScore, maxScore, docs });
      await UserLevel.update(
        { _id: attemptId },
        {
          levelScore: percentageScore,
          totalObtainScore: userLevelData.totalObtainScore
            ? userLevelData.totalObtainScore + docs.score
            : docs.score,
          totalTemplate: templateData.length,
          templateAttempted: userLevelData.templateAttempted + 1,
          ...passStatus,
          attemptStatus:
            templateData.length === userLevelData.templateAttempted + 1
              ? ATTEMPT_STATUS.COMPLETED
              : ATTEMPT_STATUS.ACTIVE,
          lastAttemptedTemplate: templateId,
        }
      );
      //calling this function to update the user track status
      updateTrackStatus(userLevelData.learnerId, levelData.trackId);
    } else {
      const templateData = await Template.get({ levelId });
      const userLevelData = await UserLevel.get({ id: attemptId });
      const levelData = await Level.get({ id: levelId });
      let passStatus = {};
      if (levelData.passingScore && templateData.length === userLevelData.templateAttempted + 1)
        passStatus["levelStatus"] =
          levelData.passingScore <= userLevelData.levelScore
            ? LEVEL_STATUS.PASS
            : LEVEL_STATUS.FAIL;
      //update score in userLevel
      await UserLevel.update(
        { _id: attemptId },
        {
          totalTemplate: templateData.length,
          templateAttempted: userLevelData.templateAttempted + 1,
          attemptStatus:
            templateData.length === userLevelData.templateAttempted + 1
              ? ATTEMPT_STATUS.COMPLETED
              : ATTEMPT_STATUS.ACTIVE,
          lastAttemptedTemplate: templateId,
          ...passStatus,
        }
      );
      //calling this function to update the user track status
      updateTrackStatus(userLevelData.learnerId, levelData.trackId);
    }
  });
};
