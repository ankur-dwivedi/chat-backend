const { Router } = require('express');
const {
  createMessage,
  getMessage,
} = require('./controller');

const { withAuthUser } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/schema');

const {
  createMessageContract,
  getMessageContract,
} = require('./contract');

const userRouter = Router();

userRouter.post('/',withAuthUser, validate('body', createMessageContract), createMessage);
userRouter.get('/',withAuthUser, validate('query', getMessageContract), getMessage);

module.exports = userRouter;
