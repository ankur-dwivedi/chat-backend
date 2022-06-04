const { Router } = require('express');
const trackController = require('./controller');
const { withAuthUser } = require('../../middlewares/auth');
const {
  createTrackContract,
  createTrackUsingLearnerIdContract,
  transferTrackOwnerContract,
  updateTrackUsingLearnerIdContract,
} = require('./contract');
const { validate } = require('../../middlewares/schema');

const trackRouter = Router();

// apis for admin side
trackRouter.get('/fetchTrackByCreatorId', withAuthUser, trackController.get.fetchTrackByCreatorId);
trackRouter.get(
  '/fetchTrackByGroupId/:groupId',
  withAuthUser,
  trackController.get.fetchTrackByGroups
);
trackRouter.get(
  '/getTracksWithoutUserCreatedGroup',
  withAuthUser,
  trackController.get.getTracksWithoutUserCreatedGroup
);
trackRouter.get(
  '/fetchTrackInfoForTransferTab',
  withAuthUser,
  trackController.get.fetchTrackInfoForTransferTab
);

trackRouter.post(
  '/createTrack',
  validate('body', createTrackContract),
  withAuthUser,
  trackController.post.createTrack
);
trackRouter.post(
  '/createTrackUsingLearnerId',
  validate('body', createTrackUsingLearnerIdContract),
  withAuthUser,
  trackController.post.createTrackUsingLearnerId
);
trackRouter.post(
  '/transferTrackOwner',
  validate('body', transferTrackOwnerContract),
  withAuthUser,
  trackController.post.transferTrackOwner
);

trackRouter.put(
  '/updateTrack/:trackId',
  validate('body', createTrackContract),
  withAuthUser,
  trackController.put.updateTrack
);
trackRouter.put(
  '/updateTrackUsingLearnerId/:trackId',
  validate('body', updateTrackUsingLearnerIdContract),
  withAuthUser,
  trackController.put.updateTrackUsingLearnerId
);

trackRouter.delete('/deleteTrack/:trackId', withAuthUser, trackController.delete.deleteTrack);
// apis for lerner side
trackRouter.get(
  '/fetchTrackAssignedToLearner',
  withAuthUser,
  trackController.get.fetchTrackAssignedToLearner
);

module.exports = trackRouter;
