const bcrypt = require('bcrypt');
const {
  update,
  get,
  create,
  deleteUser,
  deleteUsers,
  getGroupEmployee,
  searchByEmp,
  getUserWithOrg,
  getUserAndOrgByEmpId,
  passwordCompare,
  findPaginatedUsers,
} = require('../../models/user/services');
const { update: updateOrg } = require('../../models/organization/services');
const { getOrgEmployee } = require('../../models/user/services');
const { generateError } = require('../../utils/error');
const {
  generateAccessToken,
  generateOtp,
  analyicsData,
  analyicslist,
  generateRefreshToken,
} = require('../../utils/general');
const md5 = require('md5');
const { OTP_EXPIRY } = require('../../models/user/constants');
const { sendMail, createDynamicQueryPagination, processPaginatedResults } = require('../user/util');
var axios = require('axios');

exports.getUsers = async (req, res) =>
  getUserWithOrg({ userId: req.user._id }).then((user) =>
    res.send({
      status: 200,
      success: true,
      data: user,
    })
  );

exports.searchUser = async (req, res) => {
  return searchByEmp({ ...req.query, organization: req.user.organization })
    .then((user) =>
      res.send({
        status: 200,
        success: true,
        data: user,
      })
    )
    .catch((error) => res.status(400).send({ message: error }));
};

exports.register = async (req, res) => {
  try {
    const org = req.body.organization ? req.body.organization : req.user.organization;
    query = {
      ...req.body,
      organization: org,
    };
    const userData = await create(query);
    //updating Org update time
    const orgQueryObject = { $and: [{ _id: org }] };
    const orgUpdateObject = {
      updatedAt: new Date(),
    };
    await updateOrg(orgQueryObject, orgUpdateObject);
    res.send({
      status: 200,
      success: true,
      data: userData,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue);
      const processedField = field.includes('phoneNumber')
        ? 'phone number'
        : field.includes('employeeId')
        ? 'Employee ID'
        : field;
      res.status(409).send({
        message: `An account with that ${processedField} already exists.`,
      });
    } else {
      res.status(400).send({ message: err.message });
    }
  }
};

exports.login = (req, res, next) => {
  let query = {};
  const userTypedPassword = req.body.password;
  query.employeeId = req.body.employeeId;
  query.password = userTypedPassword;
  query.organization = req.body.organization;
  return get({ ...query })
    .then((user) => {
      const { password, ...userData } = user;
      if (password === undefined) {
        return generateError();
      }
      if (user.blocked) return generateError('User is blocked');
      // this is just nested ternary conditions which is first checking userData is present in database or not
      // then it is checking the password provided is valid or not
      return user
        ? passwordCompare(userTypedPassword, password).then((match) =>
            match
              ? res.send({
                  status: 200,
                  success: true,
                  data: {
                    ...JSON.parse(JSON.stringify(userData)),
                    refreshToken: generateRefreshToken(user._id),
                    accessToken: generateAccessToken(user._id),
                  },
                })
              : generateError()
          )
        : generateError();
    })
    .catch((err) => {
      if (err.message.indexOf('User is blocked') !== -1)
        res.status(400).send({ message: err.message });
      else res.status(400).send({ message: `Invalid Employee ID or Password` });
    });
};

exports.deleteUser = async (req, res) =>
  deleteUser(req.body.id).then((user) =>
    user.deletedCount ? res.send('User deleted') : res.send("User already deleted or doesn't exist")
  );

exports.deleteUsers = async (req, res) => {
  const deleteResponse = await deleteUsers(req.body.employees);
  //updating Org update time
  const orgQueryObject = { $and: [{ _id: req.user.organization }] };
  const orgUpdateObject = {
    updatedAt: new Date(),
  };
  await updateOrg(orgQueryObject, orgUpdateObject);
  res.send(
    deleteResponse.deletedCount ? `${deleteResponse.deletedCount} users deleted` : 'Delete Failed'
  );
};

exports.update = async (req, res) => {
  try {
    const queryObject = { $and: [{ _id: req.body.id }] };
    const updateObject = { ...req.body };
    delete updateObject.id;
    if (updateObject.password) updateObject.password = await bcrypt.hash(updateObject.password, 10);

    const updateUser = await update(queryObject, updateObject);
    //updating Org update time
    const orgQueryObject = { $and: [{ _id: req.user.organization }] };
    const orgUpdateObject = {
      updatedAt: new Date(),
    };
    await updateOrg(orgQueryObject, orgUpdateObject);
    res.send({
      status: 200,
      success: true,
      data: updateUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue);
      const processedField = field.includes('phoneNumber')
        ? 'phone number'
        : field.includes('employeeId')
        ? 'Employee ID'
        : field;
      res.status(409).send({
        message: `An account with that ${processedField} already exists.`,
      });
    } else {
      res.status(400).send({ message: err.message });
    }
  }
};

const sendOtp = (phone, otp) => {
  console.log({ phone });
  var config = {
    method: 'get',
    url: `https://2factor.in/API/V1/${process.env.OTP_KEY}/SMS/${phone}/${otp}`,
    headers: {},
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};

exports.requestOtp = async ({ body }, res) => {
  try {
    const { employeeId, organization } = body;
    const otp = generateOtp();
    const message = `Otp sent`;
    const User = await get({ employeeId, organization });
    if (User && User.password)
      generateError('This ID is already registered, please go to login or forgot password');
    if (User.blocked) return generateError('User is blocked');
    await update(
      { $and: [{ employeeId: employeeId }, { organization: organization }] },
      { otp: { expiry: new Date().getTime() + OTP_EXPIRY, value: otp } }
    );
    if (User.email) await sendMail(otp, User.email, '');
    else sendOtp(User.phoneNumber, otp);
    return res.send(message);
  } catch (err) {
    if (err.message.indexOf('User is blocked') !== -1)
      res.status(400).send({ message: err.message });
    res.status(400).send({ message: err.message });
  }
};

exports.verifyOtp = async ({ body }, res) =>
  get({ employeeId: body.employeeId, organization: body.organization }).then((user) => {
    const savedOtp = user.otp.value;
    const { expiry } = user.otp;
    const currentDate = new Date();
    const difference = expiry - currentDate.getTime();
    const status =
      body.otp === savedOtp ? (difference > 0 ? 'Success' : 'Otp has Expired') : 'Invalid OTP';
    status === 'Success'
      ? res.send({
          status: 200,
          success: true,
          data: {
            ...JSON.parse(JSON.stringify(user)),
            refreshToken: generateRefreshToken(user._id),
            accessToken: generateAccessToken(user._id),
          },
        })
      : res.status(400).send({
          success: false,
          data: null,
          message: status,
        });
  });

exports.forgetPassword = async (req, res) => {
  try {
    const { employeeId, organization } = req.body;
    const user = await getUserAndOrgByEmpId({ employeeId, organization });
    if (user.email)
      await sendMail(0, user.email, generateAccessToken(user._id), user.organization.domain);
    else sendOtp(user.phoneNumber, otp); //it is not decided/confirmed yet what to do in mobile

    res.send({ message: 'link sent to registered email' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  getOrgEmployee;
};

exports.resetpass = async (req, res, next) => {
  update(
    { _id: req.user._id },
    {
      password: await bcrypt.hash(req.body.password, 10),
    }
  )
    .then((user) =>
      user ? res.send('Password Reset Succesfully') : generateError('Unable to reset Password')
    )
    .catch((err) => {
      res.status(400).send({ message: `${err.message} Already exists` });
    });
};

exports.getFilteredEmp = async (req, res) => {
  try {
    let employees = [],
      activeFilter = [];
    if (req.body.data && req.body.data.length) {
      employees = await getGroupEmployee(req.user.organization, req.body.data);
      const filterObject = {};
      for (let data of employees) {
        for (let empData of data.employeeData) {
          if (
            filterObject[empData.name] &&
            filterObject[empData.name].indexOf(empData.value) === -1
          )
            filterObject[empData.name] = [...filterObject[empData.name], empData.value];
          else if (!filterObject[empData.name]) filterObject[empData.name] = [empData.value];
        }
      }
      for (let data in filterObject) {
        activeFilter.push({
          name: data,
          value: filterObject[data],
        });
      }
    } else employees = await getOrgEmployee({ organization: req.user.organization });
    employees = employees.map((data) => {
      const ob = {
        ...JSON.parse(JSON.stringify(data)),
      };
      delete ob.employeeData;
      return ob;
    });
    res.send({
      status: 200,
      success: true,
      data: req.body.data.length ? { employees, activeFilter } : { employees },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
};

exports.setSession = async (req, res) => {
  try {
    const queryObject = { $and: [{ _id: req.user._id }] };
    const updateObject = { lastSession: req.body.role };
    await update(queryObject, updateObject).then((user) => ({
      status: 200,
      success: true,
      data: user,
    }));
    return res.send({ message: 'session set successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const { trackId, groupId, levelId } = req.query;
    const data = await analyicsData({ groupId, trackId, levelId });
    return res.send({
      status: 200,
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(204).send({ error: error.message });
  }
};

exports.analyticsEmpData = async (req, res) => {
  try {
    const { trackId, groupId, levelId } = req.query;
    const list = await analyicslist({ groupId, trackId, levelId });
    return res.send({
      status: 200,
      success: true,
      data: list,
    });
  } catch (error) {
    res.status(204).send({ error: error.message });
  }
};

exports.getPaginatedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skipIndex = (page - 1) * limit;
    const { search, filterCreator, filterInactive } = req.query;
    const query = createDynamicQueryPagination(
      search,
      filterCreator,
      filterInactive,
      req.user.organization
    );
    const data = await findPaginatedUsers({
      limit,
      skipIndex,
      query,
    });
    // Process data returned from DB
    const processedData = processPaginatedResults(data);
    return res.send({
      status: 200,
      success: true,
      data: processedData,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
