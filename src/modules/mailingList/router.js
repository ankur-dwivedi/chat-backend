const { Router } = require('express');
const { createMailingRecord, getMailingList } = require('./controller');
const { withAuthUser } = require('../../middlewares/auth/index');

const mailingListRouter = Router();

mailingListRouter.post('/', createMailingRecord);
mailingListRouter.get('/getMailingList', withAuthUser, getMailingList);

module.exports = mailingListRouter;
