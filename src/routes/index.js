const { Router } = require("express");
const userRouter = require("../modules/user/router.js");
const router = Router();


router.get("/", (_, res) => res.send());
router.use("/user", userRouter);

module.exports = router;
