const { Router } = require('express');
const {
  register,
  getUsers,
  login,
  getUserDetail,
} = require('./controller');

const { withAuthUser } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/schema');

const {
  registerUserContract,
  loginContract,
} = require('./contract');

const userRouter = Router();

userRouter.get('/', withAuthUser, getUsers);
userRouter.get('/detail', withAuthUser, getUserDetail);
userRouter.post('/', validate('body', registerUserContract), register);
userRouter.post('/login', validate('body', loginContract), login);

module.exports = userRouter;
