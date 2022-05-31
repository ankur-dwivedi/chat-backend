const { Router } = require("express");
const levelController = require("./controller");
const { withAuthUser, withAdminAuthUser } = require("../../middlewares/auth");
const { createLevelContract, updateLevelContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const levelRouter = Router();
//validate(createLevelContract)
levelRouter.get("/fetchUserLevel", withAuthUser, levelController.get.fetchUserLevel);
levelRouter.get("/creator-level", withAuthUser, levelController.get.fetchUserLevelByTrack);
levelRouter.post(
  "/createLevel",
  validate("body",createLevelContract),
  withAuthUser,
  levelController.post.createLevel
);
levelRouter.get("/learner-level-info", withAuthUser, levelController.get.learnerLevelInfo);
levelRouter.get("/new-unlocked", withAuthUser, levelController.get.newUnlockedLevel);
levelRouter.get("/creator", withAdminAuthUser, levelController.get.fetchLevelByIdAndCreator);
levelRouter.patch(
  "/",
  validate("body",updateLevelContract),
  withAdminAuthUser,
  levelController.patch.update
);
levelRouter.get("/learner-level-info-id", withAuthUser, levelController.get.learnerLevelInfoById);

module.exports = levelRouter;
