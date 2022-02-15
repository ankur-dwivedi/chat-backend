const { Router } = require("express");
const journeyController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createJourneyContract } = require("./contract");
const { validate } = require("../../middlewares/schema");
const { getTemplates } = require("../template/controller");

const journeyRouter = Router();

journeyRouter.post(
  "/submit",
  withAuthUser,
  validate(createJourneyContract),
  journeyController.post.createJourney,
  getTemplates
);

module.exports = journeyRouter;
