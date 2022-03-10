const {
  update,
  get,
  create,
  deleteUser,
  getGroupEmployee,
  searchByEmp,
} = require("../../models/user/services");
const { getOrgEmployee } = require("../../models/user/services");
const { generateError } = require("../../utils/error");
const { generateAuthToken, generateOtp } = require("../../utils/general");
const md5 = require("md5");
const { OTP_EXPIRY } = require("../../models/user/constants");
const { sendMail } = require("../user/util");

exports.getUsers = async (req, res) =>
  get(req.query).then((user) =>
    res.send({
      status: 200,
      success: true,
      data: user,
    })
  );

exports.searchUser = async (req, res) => {
  console.log({ ...req.query, organization: req.user.organization });
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
  return get({ ...query })
    .then((user) =>
      user
        ? res.send({
            status: 200,
            success: true,
            data: user,
            token: generateAuthToken(user._id),
          })
        : generateError()
    )
    .catch((err) => {
      res.status(400).send({ message: `invalid employeeId or password` });
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
  const { employeeId } = body;
  const otp = generateOtp();
  const message = `your otp is ${otp}`;
  const User = await get({ employeeId: body.employeeId });
  const result = await update(
    { employeeId },
    { otp: { expiry: new Date().getTime() + OTP_EXPIRY, value: otp } }
  );
  if (User.email) await sendMail(otp, User.email, "");
  else sendOtp(User.phoneNumber, message);
  return res.send(message);
};

exports.verifyOtp = async ({ body }, res) =>
  get({ employeeId: body.employeeId }).then((user) => {
    const savedOtp = user.otp.value;
    const { expiry } = user.otp;
    const currentDate = new Date();
    const difference = expiry - currentDate.getTime();
    const status =
      body.otp === savedOtp ? (difference > 0 ? "Success" : "Otp has expired") : "Otp doesnt match";
    status === "Success"
      ? res.send({
          status: 200,
          success: true,
          data: {
            ...JSON.parse(JSON.stringify(user)),
            token: generateAuthToken(user._id),
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
    let query = {};
    query.employeeId = req.body.employeeId;
    const user = await get({ ...query });
    const mail = await sendMail(0, user.email, generateAuthToken(user._id));
    res.send({ message: "link sed to registered email" });
  } catch (error) {
    res.status(statuscode).send({ error: error.message });
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
    let employees = [];
    if (req.body.data && req.body.data.length)
      employees = await getGroupEmployee(req.user.organization, req.body.data);
    else employees = await getOrgEmployee({ organization: req.user.organization });
    res.send({
      status: 200,
      success: true,
      data: employees,
    });
  } catch (error) {
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
