const { Router } = require("express");
const { createMailingRecord } = require("./controller");

const applicantRouter = Router();

applicantRouter.post("/", addApplicant);

module.exports = applicantRouter;
