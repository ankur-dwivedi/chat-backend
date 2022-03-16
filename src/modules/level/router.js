const { Router } = require("express");
const levelController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createLevelContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const levelRouter = Router();
//validate(createLevelContract)
levelRouter.get("/fetchUserLevel", withAuthUser, levelController.get.fetchUserLevel);
levelRouter.get("/creator-level", withAuthUser, levelController.get.fetchUserLevelByTrack);
levelRouter.post(
  "/createLevel",
  validate(createLevelContract),
  withAuthUser,
  levelController.post.createLevel
);
levelRouter.get("/learner-level-info", withAuthUser, levelController.get.learnerLevelInfo);
levelRouter.get("/new-unlocked", withAuthUser, levelController.get.newUnlockedLevel);

module.exports = levelRouter;
