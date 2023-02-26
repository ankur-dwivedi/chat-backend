const { Router } = require('express');
const userRouter = require('../modules/user/router.js');
const messageRouter = require('../modules/message/router.js');

const router = Router();

router.get('/', (_, res) => res.send());
router.use('/user', userRouter);
router.use('/message', messageRouter);

module.exports = router;
