const { Router } = require("express");
const {
  register,
  getUsers,
  login,
  deleteUser,
  update,
  learnerLogin,
  requestOtp,
  verifyOtp,
  requestpass,
  resetpass,
  searchUser,
} = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/schema");

const {
  registerUserContract,
  editUserContract,
  loginContract,
  deleteContract,
  learnerLoginContract,
  requestOtpContract,
  verifyOtpContract,
} = require("./contract");

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/search", withAuthUser, searchUser);
userRouter.post("/", validate(registerUserContract), register);
userRouter.post("/admin-login", validate(loginContract), login);
userRouter.post("/learner-login", validate(learnerLoginContract), learnerLogin);
userRouter.post("/request-otp", validate(requestOtpContract), requestOtp);
userRouter.post("/verify-otp", validate(verifyOtpContract), verifyOtp);
userRouter.delete("/", validate(deleteContract), deleteUser);
userRouter.patch("/", validate(editUserContract), update);
userRouter.post("/resetpass", requestpass);
userRouter.patch("/resetpass", withAuthUser, resetpass);

module.exports = userRouter;
