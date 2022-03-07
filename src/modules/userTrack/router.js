const { Router } = require("express");
const userTrackController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createUserTrackInfoContract, updateUserTrackInfoContract} = require("./contract");
const { validate } = require("../../middlewares/schema");

const userTrackRouter = Router();

userTrackRouter.get("/fetchUserTrackInfo", withAuthUser, userTrackController.get.fetchUserTrackInfo);
userTrackRouter.post("/createUserTrackInfo", withAuthUser,validate(createUserTrackInfoContract), userTrackController.post.createUserTrackInfo);
userTrackRouter.get("/updateUserTrackInfo/:userTrackId", withAuthUser,validate(updateUserTrackInfoContract), userTrackController.put.updateUserTrackInfo);

module.exports = userTrackRouter;
