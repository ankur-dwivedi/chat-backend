const Template = require("../template/services");
const UserLevel = require("../userLevel/services");
const Level = require("../Level/services");

exports.initHooks = (JourneySchema) => {
  JourneySchema.post("save", async (docs) => {
    console.log({ docs });
    const { attemptId, levelId } = docs;
    //calculate percentage score
    const templateData = await Template.get({ levelId });
    const userLevelData = await UserLevel.get({ id: attemptId });
    const maxScore = templateData.reduce((total, value) => total + value.importance * 10, 0);
    const percentageScore =
      ((userLevelData.totalObtainScore ? userLevelData.totalObtainScore : 0 + docs.score) /
        maxScore) *
      100;
    //get level passing score
    const levelData = await Level.get({ id: levelId });
    let passStatus = {};
    console.log({ levelData }, templateData.length === userLevelData.templateAttempted + 1);
    if (levelData.passingScore && templateData.length === userLevelData.templateAttempted + 1)
      passStatus["levelStatus"] = levelData.passingScore <= percentageScore ? "Pass" : "Fail";
    //update score in userLevel
    await UserLevel.update(
      { _id: attemptId },
      {
        levelScore: percentageScore,
        totalObtainScore: userLevelData.totalObtainScore
          ? userLevelData.totalObtainScore
          : 0 + docs.score,
        totalTemplate: templateData.length,
        templateAttempted: userLevelData.templateAttempted + 1,
        ...passStatus,
      }
    );
  });
};
