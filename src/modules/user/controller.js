const {update,get,create,deleteUser} = require("../../models/user/services");
const { generateError } = require("../../utils/error");
const { generateAuthToken,generateOtp } = require("../../utils/general");
const md5 = require("md5");
const { OTP_EXPIRY } = require("../../models/user/constants");

exports.getUsers = async(req,res) => 
    get(req.query)
        .then((user) => (res.send({
          status: 200,
          success: true,
          data: user,
        })))

exports.register = async (req, res) =>
  create({ ...req.body})
    .then((user) => 
      res.send({
        status: 200,
        success: true,
        data: user,
      })
    )
    .catch((err) => {
      res.status(400).send({ message: `user already exists` });
    });

exports.login = (req, res, next) => {
  let query = {};
  query.username = req.body.username;
  query.password = md5(req.body.password);
  return get({ ...query })
  .then((user) =>user?
    res.send({
    status: 200,
    success: true,
    data: user,
    token: generateAuthToken(user._id),
  })
  :generateError())
  .catch((err) => {
    res.status(400).send({ message: `invalid username or password` });
  });
};

exports.learnerLogin = (req, res, next) => {
  let query = {};
  query.employeeId = req.body.employeeId;
  query.password = md5(req.body.password);
  return get({ ...query })
  .then((user) =>user?
    res.send({
    status: 200,
    success: true,
    data: user,
    token: generateAuthToken(user._id),
  })
  :generateError())
  .catch((err) => {
    res.status(400).send({ message: `invalid employeeId or password` });
  });
};

exports.deleteUser = async (req, res) => 
  deleteUser(req.body.id).then((user) =>
    user.deletedCount
      ? res.send("User deleted")
      : res.send("User aleready deleted or doesnt exist")
  );


exports.update = async(req,res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body, updatedAt: new Date() };
  delete updateObject.id;
  if (updateObject.password) updateObject.password = md5(updateObject.password)
  const updateUser= await update(queryObject, updateObject)
    .then((user) => ({
      status: 200,
      success: true,
      data: user,
    }))
    return res.send(updateUser);
    
};

const sendOtp = (phone, message) =>message

exports.requestOtp = async ({ body },res) => {
  const { employeeId } = body;
  const otp = generateOtp();
  const message = `your otp is ${otp}`;
  const User=await get({ employeeId: body.employeeId })
  const result=await update({ employeeId },{ otp: { expiry: new Date().getTime() + OTP_EXPIRY, value: otp } })
  sendOtp(User.phoneNumber, message)
  return res.send(message)
};


exports.verifyOtp = async ({ body },res) =>get({ employeeId: body.employeeId }).then((user) => {
    const savedOtp = user.otp.value;
    const { expiry } = user.otp;
    const currentDate = new Date();
    const difference = expiry - currentDate.getTime();
    const status =
      body.otp === savedOtp
        ? difference > 0
          ? "Success"
          : "Otp has expired"
        : "Otp doesnt match";
    status === "Success"
      ? res.send({
          status: 200,
          success: true,
          data: {
            ...JSON.parse(JSON.stringify(user)),
            token: generateAuthToken(user._id),
          }})
        :res.status(400).send( {
          success: false,
          data: null,
          message: status,
        })
  });
