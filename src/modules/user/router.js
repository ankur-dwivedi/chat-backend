const { Router } = require("express");
const {
  register,
  getUsers,
  login,
  deleteUser,
  update,
  setSession,
  analytics,
  analyticsEmpData,
} = require("./controller");
const { requestOtp, verifyOtp, forgetPassword, resetpass, searchUser } = require("./controller");
const { getFilteredEmp } = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/schema");

const {
  registerUserContract,
  editUserContract,
  loginContract,
  deleteContract,
  reqOtpForgetPassContract,
  verifyOtpContract,
  getFilEmpContract,
  setSessionContract,
} = require("./contract");

const userRouter = Router();

userRouter.get("/", withAuthUser, getUsers);
userRouter.get("/search", withAuthUser, searchUser);
userRouter.post("/", withAuthUser, validate(registerUserContract), register);
userRouter.post("/learner-login", validate(loginContract), login);
userRouter.post("/request-otp", validate(reqOtpForgetPassContract), requestOtp);
userRouter.post("/verify-otp", validate(verifyOtpContract), verifyOtp);
userRouter.delete("/", withAuthUser, validate(deleteContract), deleteUser);
userRouter.patch("/", withAuthUser, validate(editUserContract), update);
userRouter.post("/forget-password", validate(reqOtpForgetPassContract), forgetPassword);
userRouter.patch("/resetpass", withAuthUser, resetpass);
userRouter.get("/filter-emp", withAuthUser, validate(getFilEmpContract), getFilteredEmp);
userRouter.patch("/set-session", withAuthUser, validate(setSessionContract), setSession);
userRouter.get("/analytics", withAuthUser, analytics);
userRouter.get("/analytics-list", withAuthUser, analyticsEmpData);

module.exports = userRouter;
