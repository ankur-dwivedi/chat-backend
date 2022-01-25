const { Router } = require("express");
const { register, getUsers, login, deleteUser, update, learnerLogin } = require("./controller");
const { requestOtp, verifyOtp, requestpass, resetpass, searchUser } = require("./controller");
const { getFilteredEmp } = require("./controller");
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
  getFilEmpContract,
} = require("./contract");

const userRouter = Router();

userRouter.get("/", withAuthUser, getUsers);
userRouter.get("/search", withAuthUser, searchUser);
userRouter.post("/", withAuthUser, validate(registerUserContract), register);
userRouter.post("/admin-login", withAuthUser, validate(loginContract), login);
userRouter.post("/learner-login", withAuthUser, validate(learnerLoginContract), learnerLogin);
userRouter.post("/request-otp", withAuthUser, validate(requestOtpContract), requestOtp);
userRouter.post("/verify-otp", withAuthUser, validate(verifyOtpContract), verifyOtp);
userRouter.delete("/", withAuthUser, validate(deleteContract), deleteUser);
userRouter.patch("/", withAuthUser, validate(editUserContract), update);
userRouter.post("/resetpass", withAuthUser, requestpass);
userRouter.patch("/resetpass", withAuthUser, resetpass);
userRouter.get("/filter-emp", withAuthUser, validate(getFilEmpContract), getFilteredEmp);

module.exports = userRouter;
