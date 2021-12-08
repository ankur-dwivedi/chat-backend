const { Router } = require("express");
const userRouter = require("../modules/user/router.js");
const organizationRouter = require("../modules/organization/router.js");
const groupRouter = require("../modules/group/router.js");
const router = Router();


router.get("/", (_, res) => res.send());
router.use("/user", userRouter);
router.use("/organization", organizationRouter);
router.use("/group", groupRouter);

module.exports = router;
