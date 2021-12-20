const { Router } = require("express");
const {register,getUsers,login,deleteUser,update,learnerLogin} = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/schema");

const {registerUserContract,editUserContract,loginContract,deleteContract,learnerLoginContract} = require("./contract");

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.post("/",validate(registerUserContract), register);
userRouter.post("/admin-login",validate(loginContract), login);
userRouter.post("/learner-login",validate(learnerLoginContract), learnerLogin);
userRouter.delete("/",validate(deleteContract), deleteUser);
userRouter.patch("/",validate(editUserContract), update);

module.exports = userRouter;
