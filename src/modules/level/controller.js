const { LEVEL_STATE, LOCKED_STATE, LEVEL_TYPE } = require('../../models/level/constants');
const level_Model = require('../../models/level/index');
const {
  LEVEL_STATUS,
  LEVEL_STATUS_ENUM,
  ATTEMPT_STATUS,
} = require('../../models/userLevel/constants');
const { getLatestUserLevelByLevel } = require('../../models/userLevel/services');
const { update, deleteProperty } = require('../../models/level/services');
const { sendLevelCreationMailsToUsers } = require('./util');
const { generateError } = require('../../utils/error');
module.exports = {
  get: {
    fetchLevelByIdAndCreator: async (req, res) => {
      try {
        const userData = req.user;
        const level = await level_Model.findOne({
          creatorUserId: userData._id,
          _id: req.query.levelId,
        });
        if (level === null)
          return res.status(201).json({ status: 'success', message: `no Data in db` });
        return res.status(201).json({ status: 200, success: true, data: level });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchUserLevel: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await level_Model.find({
          creatorUserId: userData._id,
        });
        if (userTrackData === null) {
          return res.status(201).json({ status: 'success', message: `no Data in db` });
        }
        return res.status(201).json({ status: 'success', message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchUserLevelByTrack: async (req, res) => {
      try {
        let trackId = req.query.trackId;
        let userTrackData = await level_Model.find({ trackId });
        if (userTrackData === null) {
          return res.status(201).json({ status: 'success', message: `no Data in db` });
        }
        return res.status(201).json({ status: 'success', data: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    learnerLevelInfo: async (req, res) => {
      try {
        let trackId = req.query.trackId;
        let levelData = await level_Model
          .find({ trackId, levelState: LEVEL_STATE.LAUNCH })
          .populate({
            path: 'trackId',
            select: 'selectedTheme trackName description',
          });
        if (levelData === null || !levelData.length)
          return res.status(204).json({
            status: 'failed',
            message: `Track Not Found (Please check the Track ID)`,
          });

        const updatedLevlelData = levelData.map(async (data, index) => {
          const userLevelData = await getLatestUserLevelByLevel({
            levelId: data._id,
            learnerId: req.user._id,
          });

          //calculate lock state
          let lockedState;
          if (data.isLocked) {
            if (index == 0) lockedState = LOCKED_STATE.UNLOCKED;
            else {
              const previousLevel = levelData[index - 1];
              const prevUserLevelData = await getLatestUserLevelByLevel({
                levelId: previousLevel._id,
                learnerId: req.user._id,
              });
              if (prevUserLevelData[0] && previousLevel.passingScore) {
                if (prevUserLevelData[0].levelStatus === LEVEL_STATUS.PASS)
                  lockedState = LOCKED_STATE.UNLOCKED;
                else lockedState = LOCKED_STATE.LOCKED;
              } else if (
                prevUserLevelData[0] &&
                prevUserLevelData[0].templateAttempted === prevUserLevelData[0].totalTemplate
              )
                lockedState = LOCKED_STATE.UNLOCKED;
              else lockedState = LOCKED_STATE.LOCKED;
            }
          } else lockedState = LOCKED_STATE.UNLOCKED;

          if (userLevelData && userLevelData.length) {
            const score = userLevelData[0].levelScore;
            const completed =
              (userLevelData[0].templateAttempted / userLevelData[0].totalTemplate) * 100;
            const passState = userLevelData[0].levelStatus;
            let ob = {};
            if (data.dueDate)
              ob = {
                ...JSON.parse(JSON.stringify(data)),
                score,
                completed,
                passState,
                lockedState,
                attemptStatus: userLevelData[0].attemptStatus,
                isOverdue: data.dueDate < userLevelData[0].updatedAt,
                lastAttempted: userLevelData[0].updatedAt,
              };
            else
              ob = {
                ...JSON.parse(JSON.stringify(data)),
                score,
                completed,
                passState,
                lockedState,
                attemptStatus: userLevelData[0].attemptStatus,
                lastAttempted: userLevelData[0].updatedAt,
              };
            return ob;
          }

          return { ...JSON.parse(JSON.stringify(data)), lockedState };
        });
        levelData = await Promise.all(updatedLevlelData);
        levelData = levelData.filter((data) => data !== null);
        return res.status(201).json({ status: 'success', data: levelData });
      } catch (err) {
        console.log(err);
        res.status(201).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    newUnlockedLevel: async (req, res) => {
      try {
        const levelId = req.query.levelId;
        const level = await level_Model.findOne({ _id: levelId });
        if (level === null) {
          return res.status(201).json({ status: 'success', message: `no Data in db` });
        }
        let levelData = await level_Model.find({
          trackId: level.trackId,
          levelState: LEVEL_STATE.LAUNCH,
        });
        let nextLevelIndex;
        levelData.map((data, index) => {
          console.log('temp', level._id, data._id);
          if ('' + data._id == '' + level._id) nextLevelIndex = index;
          return data;
        });
        console.log({ nextLevelIndex });
        nextLevelIndex = nextLevelIndex + 1 < levelData.length ? nextLevelIndex + 1 : -1;
        console.log({ level, levelData, nextLevelIndex });

        let nextLevel;
        if (nextLevelIndex !== -1) nextLevel = levelData[nextLevelIndex];
        else
          return res.send({
            status: 200,
            success: false,
            data: 'no new unlockedlevel',
          });
        console.log({ nextLevel });
        const userLevelData = await getLatestUserLevelByLevel({
          levelId,
          learnerId: req.user._id,
        });

        if (nextLevel && nextLevel.isLocked === false)
          return res.send({
            status: 200,
            success: false,
            data: 'no new unlockedlevel',
          });
        else if (userLevelData && userLevelData.length) {
          if (
            (level.levelType === LEVEL_TYPE.ASSESMENT &&
              userLevelData[0] &&
              userLevelData[0].levelStatus === LEVEL_STATUS.PASS) ||
            (level.levelType !== LEVEL_TYPE.ASSESMENT &&
              userLevelData[0] &&
              userLevelData[0].attemptStatus === ATTEMPT_STATUS.COMPLETED)
          ) {
            let flag = 0;
            userLevelData.map((data, index) => {
              if (index !== 0 && data.levelStatus === LEVEL_STATUS.PASS) {
                flag = 1;
                return data;
              }
            });
            if (flag == 1)
              return res.send({
                status: 200,
                success: false,
                data: 'no new unlockedlevel',
              });
            else {
              const nextUserLeveData = await getLatestUserLevelByLevel({
                levelId: nextLevel._id,
                learnerId: req.user._id,
              });
              if (nextUserLeveData && nextUserLeveData.length)
                return res.send({
                  status: 200,
                  success: false,
                  data: 'no new unlockedlevel',
                });
              else
                return res.send({
                  status: 200,
                  success: true,
                  data: nextLevel,
                });
            }
          } else
            return res.send({
              status: 200,
              success: false,
              data: 'no new unlockedlevel',
            });
        } else
          return res.send({
            status: 200,
            success: false,
            data: 'no new unlockedlevel',
          });

        return res.status(201).json({ status: 'success', data: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    learnerLevelInfoById: async (req, res) => {
      try {
        let levelId = req.query.levelId;
        let tempData = await level_Model.findOne({ _id: levelId });
        let trackId = tempData.trackId;
        let levelData = await level_Model
          .find({ trackId, levelState: LEVEL_STATE.LAUNCH })
          .populate({
            path: 'trackId',
            select: 'selectedTheme trackName description',
          });
        if (levelData === null || !levelData.length)
          return res.status(204).json({
            status: 'failed',
            message: `Track Not Found (Please check the Track ID)`,
          });

        const updatedLevlelData = levelData.map(async (data, index) => {
          const userLevelData = await getLatestUserLevelByLevel({
            levelId: data._id,
            learnerId: req.user._id,
          });

          //calculate lock state
          let lockedState;
          if (data.isLocked) {
            if (index == 0) lockedState = LOCKED_STATE.UNLOCKED;
            else {
              const previousLevel = levelData[index - 1];
              const prevUserLevelData = await getLatestUserLevelByLevel({
                levelId: previousLevel._id,
                learnerId: req.user._id,
              });
              if (prevUserLevelData[0] && previousLevel.passingScore) {
                if (prevUserLevelData[0].levelStatus === LEVEL_STATUS.PASS)
                  lockedState = LOCKED_STATE.UNLOCKED;
                else lockedState = LOCKED_STATE.LOCKED;
              } else if (
                prevUserLevelData[0] &&
                prevUserLevelData[0].templateAttempted === prevUserLevelData[0].totalTemplate
              )
                lockedState = LOCKED_STATE.UNLOCKED;
              else lockedState = LOCKED_STATE.LOCKED;
            }
          } else lockedState = LOCKED_STATE.UNLOCKED;

          if (userLevelData && userLevelData.length) {
            if (data.levelType === LEVEL_TYPE.ASSESMENT) return null;
            const score = userLevelData[0].levelScore;
            const completed =
              (userLevelData[0].templateAttempted / userLevelData[0].totalTemplate) * 100;
            const passState = userLevelData[0].levelStatus;
            let ob = {};
            if (data.dueDate)
              ob = {
                ...JSON.parse(JSON.stringify(data)),
                score,
                completed,
                passState,
                lockedState,
                attemptStatus: userLevelData[0].attemptStatus,
                isOverdue: data.dueDate < userLevelData[0].updatedAt,
                lastAttempted: userLevelData[0].updatedAt,
              };
            else
              ob = {
                ...JSON.parse(JSON.stringify(data)),
                score,
                completed,
                passState,
                lockedState,
                attemptStatus: userLevelData[0].attemptStatus,
                lastAttempted: userLevelData[0].updatedAt,
              };
            return ob;
          }

          return { ...JSON.parse(JSON.stringify(data)), lockedState };
        });
        levelData = await Promise.all(updatedLevlelData);
        levelData = levelData.filter((data) => data !== null);
        levelData = levelData.filter((data) => data._id === levelId);
        return res.status(201).json({ status: 'success', data: levelData[0] });
      } catch (err) {
        console.log(err);
        res.status(201).json({
          status: 'failed',
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
          organization: req.user.organization,
          isLocked: req.body.isLocked,
          allowReattempt: req.body.allowReattempt,
        };
        const level = await level_Model.create(data);
        // sendLevelCreationMailsToUsers(req.body.trackId, req.body.levelName, userData._id);
        return res.status(201).json({
          status: 'success',
          message: `successfully saved the data in db`,
          data: level,
        });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        if (err.message.indexOf('levelName_1') !== -1)
          return res.status(406).json({
            status: 'failed',
            message: `Level Name should be unique for a specific track.`,
          });
        return res.status(400).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  patch: {
    update: async (req, res) => {
      try {
        const unset = {};
        for (let data in req.body) {
          if (req.body[data] === '') unset[data] = 1;
        }
        console.log({ unset });
        const queryObject = {
          $and: [{ _id: req.body.id }, { creatorUserId: req.user._id }],
        };
        const updateObject = { ...req.body };
        delete updateObject.id;
        let updateLevel = await update(queryObject, updateObject).then((level) => ({
          status: 200,
          success: true,
          data: level,
        }));
        updateLevel = await deleteProperty(queryObject, unset).then((level) => ({
          status: 200,
          success: true,
          data: level,
        }));
        return res.send(updateLevel);
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        if (err.message.indexOf('levelName_1') !== -1) {
          return res.status(406).json({
            status: 'failed',
            message: `Level Name should be unique for a specific track`,
          });
        }
        return res.status(400).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  put: {},
  delete: {},
};
