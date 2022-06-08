const { Router } = require('express');
const {
  create,
  getTemplates,
  deleteTemplate,
  uploadTemplateMedia,
  checkLevelType,
  createFeedback,
  templateCount,
  getCreatorTemplate,
  templateOrder,
  update,
} = require('./controller');
const { validate } = require('../../middlewares/schema');
const {
  createContract,
  deleteContract,
  createFeedbackContract,
  setTemplateOrder,
  updateContract,
} = require('./contract');
const multer = require('multer');
const { withAuthUser, withAuthLearner, withAdminAuthUser } = require('../../middlewares/auth');

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const templateRouter = Router();

templateRouter.get('/', withAuthLearner, checkLevelType);
templateRouter.post('/', withAuthUser, validate('body', createContract), create);
templateRouter.delete('/', withAuthUser, validate('body', deleteContract), deleteTemplate);
templateRouter.post('/upload', withAuthUser, upload.array('files'), uploadTemplateMedia);
templateRouter.post(
  '/create-feedback',
  withAuthLearner,
  validate('body', createFeedbackContract),
  createFeedback
);
templateRouter.get('/template-count', withAuthLearner, templateCount);
templateRouter.get('/creator', withAdminAuthUser, getCreatorTemplate);
templateRouter.patch(
  '/template-order',
  withAdminAuthUser,
  validate('body', setTemplateOrder),
  templateOrder
);
templateRouter.patch('/', validate('body', updateContract), withAdminAuthUser, update);

module.exports = templateRouter;
