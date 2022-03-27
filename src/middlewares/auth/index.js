const expressJwt = require("express-jwt");
const User = require("../../models/user");
const Level = require("../../models/level");
const Template = require("../../models/template");
const Track = require("../../models/Track");
const { createUnauthorizedError, generateAccessToken } = require("../../utils/general");
const { ROLE } = require("../../models/user/constants");

const verifyAccessToken = expressJwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

const verifyRefreshToken = expressJwt({
  secret: process.env.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
});

const refreshAuthUser = (req, res, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        res.send({ status: 200, success: true, accessToken: generateAccessToken(user._id) });
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

const assocAuthUser = (req, res, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

// authenticate learner for tracks and level also
const assocAuthLearner = (req, res, next) =>
  User.findById(req.user.userId)
    .then(async (user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        if (req.body.templateId) {
          const template = await Template.findById(req.body.templateId);
          const track = await Track.findById(template.trackId);
          const filteredArray = track.groupId.filter(function (n) {
            return user.groups.indexOf(n) !== -1;
          });
          if (filteredArray && filteredArray.length) {
            req.template = template;
            next();
          } else return res.status(401).send({ message: "User not Authorised for template" });
        } else if (req.query.levelId) {
          const level = await Level.findById(req.query.levelId);
          if (!level)
            return res
              .status(204)
              .send({ message: " Level Not Found (Please check the Level ID)" });
          const track = await Track.findById(level.trackId);
          const filteredArray = track.groupId.filter(function (n) {
            return user.groups.indexOf(n) !== -1;
          });
          if (filteredArray && filteredArray.length) {
            req.level = level;
            next();
          } else return res.status(401).send({ message: "User not Authorised for level" });
        } else next();
      }
    })
    .catch((error) => {
      console.log(error);
      res.send(createUnauthorizedError(error));
    });

const isAdmin = (req, res, next) =>
  User.findById(req.user.userId)
    .then(async (user) => {
      if (!user) {
        res.send(createUnauthorizedError("Not Authorized"));
      } else if (user.role !== ROLE.CREATOR) {
        res.send(createUnauthorizedError("Not Authorized"));
      } else {
        req.user = user;
        if (req.body.levelId) {
          const level = await Level.findById(req.body.levelId);
          if (level && level.creatorUserId.toString() !== user._id.toString()) {
            res.status(401).send({ message: "User not Authorised for level" });
          }
        }
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

const withAuthUser = [verifyAccessToken, assocAuthUser];
const withAdminAuthUser = [verifyAccessToken, isAdmin];
const withAuthLearner = [verifyAccessToken, assocAuthLearner];
const withNewUser = [verifyRefreshToken, refreshAuthUser];

const withOptionalAuthUser = [
  ...withAuthUser,
  (error, req, res, next) => {
    if (error.status === 401) {
      req.user = {};
      next();
    } else {
      next(error);
    }
  },
];

module.exports = {
  verifyAccessToken,
  assocAuthUser,
  isAdmin,
  withAuthUser,
  withAdminAuthUser,
  withOptionalAuthUser,
  withAuthLearner,
  withNewUser,
};
