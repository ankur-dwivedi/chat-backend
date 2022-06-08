const { Router } = require('express');
const {
  create,
  getGroups,
  deleteGroup,
  createGroupEmployee,
  createGpByEmpList,
  countEmpInCsv,
  getGroupById,
  update,
} = require('./controller');
const { validate } = require('../../middlewares/schema');
const {
  createContract,
  deleteContract,
  createByEmpListContract,
  updateContract,
} = require('./contract');
const { withAuthUser, withAdminAuthUser } = require('../../middlewares/auth');
const multer = require('multer');

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

const groupRouter = Router();

groupRouter.get('/', withAuthUser, getGroups);
groupRouter.get('/group-id', withAuthUser, getGroupById);
groupRouter.post('/', withAuthUser, validate('body', createContract), create);
groupRouter.delete('/', withAuthUser, validate('body', deleteContract), deleteGroup);
groupRouter.post('/create-custom', withAuthUser, upload.array('files'), createGroupEmployee);
groupRouter.post('/count-employee', withAuthUser, upload.array('files'), countEmpInCsv);
groupRouter.post(
  '/create-by-list',
  withAuthUser,
  validate('body', createByEmpListContract),
  createGpByEmpList
);
groupRouter.patch('/', withAdminAuthUser, validate('body', updateContract), update);
module.exports = groupRouter;
