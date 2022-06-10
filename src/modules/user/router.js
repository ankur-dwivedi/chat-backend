const { Router } = require('express');
const {
  register,
  getUsers,
  login,
  deleteUser,
  deleteUsers,
  update,
  setSession,
  analytics,
  analyticsEmpData,
  getPaginatedUsers,
} = require('./controller');
const { requestOtp, verifyOtp, forgetPassword, resetpass, searchUser, findUserByEmpId } = require('./controller');
const { getFilteredEmp } = require('./controller');
const { withAuthUser, withNewUser, withAdminAccess } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/schema');

const {
  registerUserContract,
  editUserContract,
  loginContract,
  deleteSingleContract,
  deleteMultipleContract,
  reqOtpForgetPassContract,
  verifyOtpContract,
  getFilEmpContract,
  setSessionContract,
} = require('./contract');

const userRouter = Router();

userRouter.get('/', withAuthUser, getUsers);
userRouter.get('/search', withAuthUser, searchUser);
userRouter.get('/findByEmpId', withAdminAccess, findUserByEmpId)
userRouter.post('/', withAdminAccess, validate('body', registerUserContract), register);
userRouter.post('/learner-login', validate('body', loginContract), login);
userRouter.post('/request-otp', validate('body', reqOtpForgetPassContract), requestOtp);
userRouter.post('/verify-otp', validate('body', verifyOtpContract), verifyOtp);
userRouter.delete('/delete-user', withAuthUser, validate('body', deleteSingleContract), deleteUser);
userRouter.delete(
  '/delete-users',
  withAdminAccess,
  validate('body', deleteMultipleContract),
  deleteUsers
);
userRouter.patch('/', withAdminAccess, validate('body', editUserContract), update);
userRouter.post('/forget-password', validate('body', reqOtpForgetPassContract), forgetPassword);
userRouter.patch('/resetpass', withAuthUser, resetpass);
userRouter.post('/filter-emp', withAuthUser, validate('body', getFilEmpContract), getFilteredEmp);
userRouter.patch('/set-session', withAuthUser, validate('body', setSessionContract), setSession);
userRouter.get('/analytics', withAuthUser, analytics);
userRouter.get('/analytics-list', withAuthUser, analyticsEmpData);
userRouter.post('/create-access-token', withNewUser);
userRouter.get('/paginated-users', withAdminAccess, getPaginatedUsers);

module.exports = userRouter;
