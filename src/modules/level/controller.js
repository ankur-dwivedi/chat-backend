const { LEVEL_STATE, LOCKED_STATE } = require("../../models/level/constants");
const level_Model = require("../../models/level/index");
const { LEVEL_STATUS } = require("../../models/userLevel/constants");
const { getLatestUserLevelByLevel } = require("../../models/userLevel/services");
const { sendLevelCreationMailsToUsers } = require("./util");
module.exports = {
  get: {
    fetchUserLevel: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await level_Model.find({ creatorUserId: userData._id });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchUserLevelByTrack: async (req, res) => {
      try {
        let trackId = req.body.trackId;
        let userTrackData = await level_Model.find({ trackId });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    learnerLevelInfo: async (req, res) => {
      try {
        let trackId = req.query.trackId;
        let levelData = await level_Model.find({ trackId, levelState: LEVEL_STATE.LAUNCH });
        if (levelData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        const updatedLevlelData = levelData.map(async (data, index) => {
          const userLevelData = await getLatestUserLevelByLevel({ levelId: data._id });

          //calculate lock state
          let lockedState;
          if (index == 0) lockedState = LOCKED_STATE.UNLOCKED;
          else {
            const previousLevel = levelData[index - 1];
            const prevUserLevelData = await getLatestUserLevelByLevel({
              levelId: previousLevel._id,
            });
            if (
              prevUserLevelData[0] &&
              previousLevel.passingScore &&
              prevUserLevelData[0].levelStatus === LEVEL_STATUS.PASS
            )
              lockedState = LOCKED_STATE.UNLOCKED;
            else if (prevUserLevelData[0].templateAttempted === prevUserLevelData[0].totalTemplate)
              lockedState = LOCKED_STATE.UNLOCKED;
            else lockedState = LOCKED_STATE.LOCKED;
          }

          if (userLevelData && userLevelData[0]) {
            const score = userLevelData[0].levelScore;
            const completed =
              (userLevelData[0].templateAttempted / userLevelData[0].totalTemplate) * 100;
            const passState = userLevelData[0].levelStatus;
            return {
              ...JSON.parse(JSON.stringify(data)),
              score,
              completed,
              passState,
              lockedState,
            };
          }

          return { ...JSON.parse(JSON.stringify(data)), lockedState };
        });
        levelData = await Promise.all(updatedLevlelData);
        return res.status(201).json({ status: "success", data: levelData });
      } catch (err) {
        res.status(201).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  post: {
    createLevel: async (req, res) => {
      try {
        let userData = req.user;
        let data = {
          creatorUserId: userData._id,
          trackId: req.body.trackId,
          levelName: req.body.levelName,
          levelDescription: req.body.levelDescription,
          levelState: req.body.levelState,
          passingScore: req.body.passingScore,
          employeeRetryInDays: req.body.employeeRetryInDays,
          totalMinutes: req.body.totalMinutes,
          dueDate: req.body.dueDate,
          levelType: req.body.levelType,
          levelTags: req.body.levelTags,
          organization: req.user.organization,
        };
        await level_Model.create(data);
        sendLevelCreationMailsToUsers(req.body.trackId, req.body.levelName, userData._id);
        return res
          .status(201)
          .json({ status: "success", message: `successfully saved the data in db` });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  put: {},
  delete: {},
};
