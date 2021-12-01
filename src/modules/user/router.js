const { Router } = require("express");
const {register,getUsers,login,deleteUser,update} = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/schema");

const {registerUserContract,editUserContract,loginContract,deleteContract} = require("./contract");

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.post("/",validate(registerUserContract), register);
userRouter.post("/login",validate(loginContract), login);
userRouter.delete("/",validate(deleteContract), deleteUser);
userRouter.patch("/",validate(editUserContract), update);

module.exports = userRouter;
