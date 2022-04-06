const { Router } = require("express");
const { upload } = require("../../utils/general");
const { addApplicant, uploadResume } = require("./controller");

const applicantRouter = Router();

applicantRouter.post("/", addApplicant);
applicantRouter.post("/upload", upload.array("files"), uploadResume);
module.exports = applicantRouter;
