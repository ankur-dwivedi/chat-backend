const { Router } = require("express");
const journeyController = require("./controller");
const { withAuthLearner, withAuthUser } = require("../../middlewares/auth");
const { createJourneyContract, closeAttemptContract } = require("./contract");
const { validate } = require("../../middlewares/schema");
const { getTemplates } = require("../template/controller");

const journeyRouter = Router();

journeyRouter.post(
  "/submit",
  withAuthLearner,
  validate("body",createJourneyContract),
  journeyController.post.createJourney,
  getTemplates
);
journeyRouter.post(
  "/close-attempt",
  withAuthUser,
  validate("body",closeAttemptContract),
  journeyController.post.closeAttempt
);
module.exports = journeyRouter;
