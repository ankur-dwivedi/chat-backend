const { Router } = require("express");
const levelController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createLevelContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const trackRouter = Router();
//validate(createLevelContract)
trackRouter.get("/fetchUserLevel",withAuthUser, levelController.get.fetchUserLevel);
trackRouter.post("/createLevel",withAuthUser, levelController.post.createLevel);


module.exports = trackRouter;
