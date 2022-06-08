const { Router } = require('express');
const userRouter = require('../modules/user/router.js');
const trackRouter = require('../modules/Track/router.js');
const levelRouter = require('../modules/level/router.js');
const journeyRouter = require('../modules/journey/router.js');
const organizationRouter = require('../modules/organization/router.js');
const groupRouter = require('../modules/group/router.js');
const templateRouter = require('../modules/template/router.js');
const filterDataRouter = require('../modules/filterData/router.js');
const userTrackRouter = require('../modules/userTrack/router.js');
const mailingListRouter = require('../modules/mailingList/router.js');
const applicantRouter = require('../modules/applicant/router.js');

const router = Router();

router.get('/', (_, res) => res.send());
router.use('/user', userRouter);
router.use('/track', trackRouter);
router.use('/level', levelRouter);
router.use('/journey', journeyRouter);
router.use('/organization', organizationRouter);
router.use('/group', groupRouter);
router.use('/template', templateRouter);
router.use('/filter-data', filterDataRouter);
router.use('/level', levelRouter);
router.use('/userTrack', userTrackRouter);
router.use('/mailingList', mailingListRouter);
router.use('/applicant', applicantRouter);

module.exports = router;
