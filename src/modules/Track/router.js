const { Router } = require("express");
const trackController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createTrackContract,createTrackUsingLearnerIdContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const trackRouter = Router();

// apis for admin side
trackRouter.get("/fetchTrackByCreatorId", withAuthUser, trackController.get.fetchTrackByCreatorId);
trackRouter.get("/fetchTrackByGroupId/:groupId", withAuthUser, trackController.get.fetchTrackByGroups);
trackRouter.get("/getTracksWithoutUserCreatedGroup",withAuthUser,trackController.get.getTracksWithoutUserCreatedGroup);

trackRouter.post("/createTrack",validate(createTrackContract),withAuthUser,trackController.post.createTrack);
trackRouter.post("/createTrackUsingLearnerId",validate(createTrackUsingLearnerIdContract),withAuthUser,trackController.post.createTrackUsingLearnerId);

trackRouter.put('/updateTrack',validate(createTrackContract),withAuthUser,trackController.put.updateTrack)

trackRouter.delete("/deleteTrack/:trackId",withAuthUser,trackController.delete.deleteTrack);
// apis for lerner side
trackRouter.get("/fetchTrackAssignedToLearner",withAuthUser,trackController.get.fetchTrackAssignedToLearner);


module.exports = trackRouter;
