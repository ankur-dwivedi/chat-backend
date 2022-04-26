const jwt = require("jsonwebtoken");
const httpErrors = require("httperrors");
const csv = require("csvtojson");
const request = require("request");
const Group = require("../models/group/services");
const Track = require("../models/Track/services");
const Level = require("../models/level/services");
const { getLatestUserLevelByLevel } = require("../models/userLevel/services");
const User = require("../models/user/services");
const { LEVEL_STATUS } = require("../models/userLevel/constants");
const { frequencyData, passFailData } = require("./constants");
const multer = require("multer");

exports.generateAccessToken = (userId) =>
  jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

exports.generateRefreshToken = (userId) =>
  jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "90d",
  });

exports.createUnauthorizedError = (error = "Unauthorized") => httpErrors(401, error);

exports.csvToJson = async (csvUrl) => {
  let jsonArray = [];
  await csv()
    .fromStream(request.get(csvUrl))
    .subscribe((json) => {
      return new Promise((resolve, reject) => {
        jsonArray.push(json);
        resolve();
      });
    });
  return jsonArray;
};

exports.csvToJsonByStream = async (csvUrl) => {
  let jsonArray = [];
  await csv()
    .fromFile(csvUrl)
    .subscribe((json) => {
      return new Promise((resolve, reject) => {
        jsonArray.push(json);
        resolve();
      });
    });
  return jsonArray;
};

const getAuthorisedUser = async ({ groupId, trackId }) => {
  if (groupId) {
    const group = await Group.get({ id: groupId });
    return group.employees;
  } else if (trackId) {
    const track = await Track.getUsersByTrackId({ id: trackId });
    let employees = track.groupId.reduce((ar, data) => [...ar, ...data.employees], []);
    employees = employees.reduce((ar, data) => [...ar, data._id], []);
    return employees;
  }
};

const getEmpAttemptData = async ({ groupId, trackId, levelId }) => {
  const employees = await getAuthorisedUser({ groupId, trackId });
  let empData = employees.map(async (id) => {
    const userLevel = await getLatestUserLevelByLevel({
      levelId,
      learnerId: id,
    });
    return userLevel.length
      ? {
          ...JSON.parse(JSON.stringify(userLevel[0])),
          session: userLevel.length,
        }
      : null;
  });
  empData = await Promise.all(empData);
  return empData;
};

exports.analyicsData = async ({ groupId, trackId, levelId }) => {
  passFailData[0].passed = 0;
  passFailData[1].failed = 0;
  passFailData[2].unattempted = 0;
  const empData = await getEmpAttemptData({ groupId, trackId, levelId });
  empData.map((data) => {
    if (data !== null && data.levelStatus) {
      switch (data.levelStatus) {
        case LEVEL_STATUS.PASS:
          passFailData[0].passed += 1;
          break;
        case LEVEL_STATUS.FAIL:
          passFailData[1].failed += 1;
          break;
      }
    } else passFailData[2].unattempted += 1;

    if (data !== null && data.levelScore) {
      const index = Math.abs(data.levelScore / 10) !== 0 ? Math.abs(data.levelScore / 10) - 1 : 0;
      frequencyData[index].frequency += 1;
    }
  });
  return { passFailData, frequencyData };
};

exports.analyicslist = async ({ groupId, trackId, levelId }) => {
  let empData = await getEmpAttemptData({ groupId, trackId, levelId });
  const level = await Level.get({ id: levelId });
  const track = await Track.get({ id: trackId });
  empData = empData.filter((data) => {
    if (data) return data;
  });
  empData = empData.map(async (data) => {
    if (data !== null) {
      const userData = await User.getUserAnalytics({ id: data.learnerId });
      return {
        group: userData.groups,
        track: track.trackName,
        level: level.levelName,
        name: userData.name,
        employeeId: userData.employeeId,
        score: data.levelScore,
        status: data.levelStatus,
        numOfAttempts: data.session,
        dateOfAttempt: data.updatedAt,
      };
      return { user: userData, userLevel: empData };
    }
  });
  return await Promise.all(empData);
};

exports.generateOtp = () => Math.floor(100000 + Math.random() * 900000);

exports.upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/tmp");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
