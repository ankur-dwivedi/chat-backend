const { Router } = require("express");
const trackController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createTrackContract } = require("./contract");
const { validate } = require("../../models/Track");

const trackRouter = Router();

trackRouter.get("/fetchUserTrack",withAuthUser, trackController.get.fetchUserTrack);
trackRouter.post("/createTrack",validate(createTrackContract),withAuthUser, trackController.post.createTrack);


module.exports = trackRouter;
