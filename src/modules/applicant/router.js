const { Router } = require("express");
const { upload } = require("../../utils/general");
const { addApplicant, uploadResume, getApplicant} = require("./controller");
const { withAuthUser } = require("../../middlewares/auth/index");


const applicantRouter = Router();

applicantRouter.post("/", addApplicant);
applicantRouter.post("/upload", upload.array("files"), uploadResume);
applicantRouter.get("/getApplicant",withAuthUser,getApplicant)

module.exports = applicantRouter;
