const { Router } = require("express");
const journeyController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createJourneyContract } = require("./contract");
const { validate } = require("../../middlewares/schema");

const journeyRouter = Router();

journeyRouter.post(
  "/submit",
  withAuthUser,
  validate(createJourneyContract),
  journeyController.post.createJourney
);

module.exports = journeyRouter;
