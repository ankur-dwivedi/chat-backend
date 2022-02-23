const Template = require("../template/services");
const UserLevel = require("../userLevel/services");
const Level = require("../Level/services");
const { LEVEL_STATUS } = require("../userLevel/constants");

exports.initHooks = (JourneySchema) => {
  JourneySchema.post("save", async (docs) => {
    const { attemptId, levelId } = docs;
    //calculate percentage score
    const templateData = await Template.get({ levelId });
    const userLevelData = await UserLevel.get({ id: attemptId });
    const maxScore = templateData.reduce((total, value) => total + value.importance * 10, 0);
    const percentageScore =
      ((userLevelData.totalObtainScore
        ? userLevelData.totalObtainScore + docs.score
        : +docs.score) /
        maxScore) *
      100;
    //get level passing score
    const levelData = await Level.get({ id: levelId });
    let passStatus = {};
    if (levelData.passingScore && templateData.length === userLevelData.templateAttempted + 1)
      passStatus["levelStatus"] =
        levelData.passingScore <= percentageScore ? LEVEL_STATUS.PASS : LEVEL_STATUS.FAIL;
    //update score in userLevel
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
      }
    );
  });
};
