const {
  update,
  get,
  create,
  deleteUser,
  getGroupEmployee,
  searchByEmp,
  getUserWithOrg,
  getUserAndOrgByEmpId,
} = require("../../models/user/services");
const { getOrgEmployee } = require("../../models/user/services");
const { generateError } = require("../../utils/error");
const {
  generateAccessToken,
  generateOtp,
  analyicsData,
  analyicslist,
  generateRefreshToken,
} = require("../../utils/general");
const md5 = require("md5");
const { OTP_EXPIRY } = require("../../models/user/constants");
const { sendMail } = require("../user/util");

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

exports.register = async (req, res) =>
  create({ ...req.body, organization: req.user.organization })
    .then((user) =>
      res.send({
        status: 200,
        success: true,
        data: user,
      })
    )
    .catch((err) => {
      res.status(400).send({ message: `Invalid Data` });
    });

exports.login = (req, res, next) => {
  let query = {};
  query.employeeId = req.body.employeeId;
  query.password = md5(req.body.password);
  query.organization = req.body.organization;
  return get({ ...query })
    .then((user) => {
      return user
        ? res.send({
            status: 200,
            success: true,
            data: {
              ...JSON.parse(JSON.stringify(user)),
              refreshToken: generateRefreshToken(user._id),
              accessToken: generateAccessToken(user._id),
            },
          })
        : generateError();
    })
    .catch((err) => {
      res.status(400).send({ message: `Invalid Employee ID or Password` });
    });
};

exports.deleteUser = async (req, res) =>
  deleteUser(req.body.id).then((user) =>
    user.deletedCount ? res.send("User deleted") : res.send("User aleready deleted or doesnt exist")
  );

exports.update = async (req, res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body };
  delete updateObject.id;
  if (updateObject.password) updateObject.password = md5(updateObject.password);
  const updateUser = await update(queryObject, updateObject).then((user) => ({
    status: 200,
    success: true,
    data: user,
  }));
  return res.send(updateUser);
};

const sendOtp = (phone, message) => message;

exports.requestOtp = async ({ body }, res) => {
  try {
    const { employeeId, organization } = body;
    const otp = generateOtp();
    const message = `Otp sent`;
    const User = await get({ employeeId, organization });
    if (User && User.password)
      generateError("This ID is already registered, please go to login or forgot password");
    await update(
      { employeeId },
      { otp: { expiry: new Date().getTime() + OTP_EXPIRY, value: otp } }
    );
    if (User.email) await sendMail(otp, User.email, "");
    else sendOtp(User.phoneNumber, message);
    return res.send(message);
  } catch (err) {
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
      body.otp === savedOtp ? (difference > 0 ? "Success" : "Otp has Expired") : "Invalid OTP";
    status === "Success"
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
    else sendOtp(user.phoneNumber, "message");

    res.send({ message: "link sent to registered email" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  getOrgEmployee;
};

exports.resetpass = (req, res, next) => {
  update(
    { _id: req.user._id },
    {
      password: md5(req.body.password),
    }
  )
    .then((user) =>
      user ? res.send("Password Reset Succesfully") : generateError("Unable to reset Password")
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
    return res.send({ message: "session set successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const { trackId, groupId, levelId } = req.body;
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
    const { trackId, groupId, levelId } = req.body;
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
