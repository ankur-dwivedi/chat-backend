const { Router } = require("express");
const levelController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createLevelContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const levelRouter = Router();
//validate(createLevelContract)
levelRouter.get("/fetchUserLevel", withAuthUser, levelController.get.fetchUserLevel);
levelRouter.get("/fetchUserLevelByTrack", withAuthUser, levelController.get.fetchUserLevelByTrack);
levelRouter.post(
  "/createLevel",
  validate(createLevelContract),
  withAuthUser,
  levelController.post.createLevel
);

module.exports = levelRouter;
