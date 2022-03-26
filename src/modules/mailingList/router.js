const { Router } = require("express");
const { createMailingRecord } = require("./controller");

const mailingListRouter = Router();

mailingListRouter.post("/", createMailingRecord);

module.exports = mailingListRouter;
