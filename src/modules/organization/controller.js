const { update, get, create, deleteOrganization, getRestrictedInfo } = require("../../models/organization/services");
const { create: userCreate, countEmployeeInOrg, createUserAfterReplace } = require("../../models/user/services");
const { uploadFiles } = require(".././../libs/aws/upload");
const { csvToJson, csvToJsonByStream } = require("../../utils/general");
const { createUserObject } = require("./utils");
const User = require("../../models/user");

exports.getOrganizations = async (req, res) =>
  get(req.query).then((organization) =>
    res.send({
      status: 200,
      success: true,
      data: organization,
    })
  );

exports.create = async (req, res) =>
  create({ ...req.body })
    .then((organization) =>
      res.send({
        status: 200,
        success: true,
        data: organization,
      })
    )
    .catch((err) => {
      return res.status(400).send({ message: `organization already exists` });
    });

exports.deleteOrganization = async (req, res) => deleteOrganization(req.body.id).then((organization) => (organization.deletedCount ? res.send("Organization deleted") : res.send("Organization aleready deleted or doesnt exist")));

exports.update = async (req, res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body, updatedAt: new Date() };
  delete updateObject.id;
  const updateOrganization = await update(queryObject, updateObject).then((organization) => ({
    status: 200,
    success: true,
    data: organization,
  }));
  return res.send(updateOrganization);
};

exports.uploadLogo = async function (req, res) {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");

    let finalbucket = `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/logo";
    let uploadedFiles = await uploadFiles(finalbucket, files);
    const queryObject = { $and: [{ _id: req.query.org }] };
    const updateObject = {
      logo: uploadedFiles[0].Location,
      updatedAt: new Date(),
    };
    delete updateObject.id;
    await update(queryObject, updateObject).then((organization) => organization);
    res.status(200).send({
      status: "success",
      message: "files uploaded successfully",
      uploadedFiles: uploadedFiles,
    });
  } catch (error) {
    throw error;
  }
};

exports.uploadEmployeeData = async function (req, res) {
  try {
    const { files } = req;
    if (!files.length) return res.status(400).send("No file uploaded.");
    const finalbucket = `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/employee-data";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);
    const updatedData = employeeData.map((value) => createUserObject(req.query.org, value, req.query.role));
    const userNotCreated = [],
      userCreated = [];
    for (value of updatedData) {
      try {
        // if (!value.phoneNumber && !value.email) userNotCreated.push(value);
        if (Number(value.phoneNumber) === 0) {
          delete value.phoneNumber;
          if (value.email === "") delete value.email;
          const cre = await userCreate({ ...value });
          userCreated.push(cre);
        } else {
          const num = value.phoneNumber;
          if (value.email === "") delete value.email;
          const cre = await userCreate({ ...value, phoneNumber: Number(num) });
          userCreated.push(cre);
        }
      } catch (err) {
        console.log(value, err.message, userNotCreated.length);
        userNotCreated.push(value);
      }
    }
    return res.status(200).send({
      status: "success",
      message: "files uploaded successfully",
      data: { userCreated, userNotCreated },
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ message: error.message });
  }
};

exports.getRestrictedData = async (req, res) => {
  try {
    const restrictedData = await getRestrictedInfo(req.user.organization).then(async (organization) => {
      return {
        updatedAt: organization.updatedAt,
        totalEmployees: await countEmployeeInOrg({
          organization: organization._id,
        }),
      };
    });
    return res.send({
      status: 200,
      success: true,
      data: restrictedData,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// replace employeed Data with csv retain if email or phone found
exports.replaceEmployeeData = async function (req, res) {
  try {
    const { files } = req;
    if (!files.length) return res.status(400).send("No file uploaded.");
    const employeeData = await csvToJsonByStream(files[0].path);

    // upload csv to s3 bucket
    // const finalbucket = `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/employee-data";
    // await uploadFiles(finalbucket, files);
    const userNotCreated = [],
      userCreated = [];
    const updatedEmpData = [];

    for (emp of employeeData) {
      let user = {},
        updateUser;

      //  check existing data to retain
      if (emp.email && emp.phoneNumber) user = await User.findOne({ $or: [{ $and: [{ email: emp.email }, { organization: req.query.org }] }, { $and: [{ phoneNumber: emp.phoneNumber }, { organization: req.query.org }] }] });
      else if (emp.email) user = await User.findOne({ $and: [{ email: emp.email }, { organization: req.query.org }] });
      else if (emp.phoneNumber) user = await User.findOne({ $and: [{ phoneNumber: emp.phoneNumber }, { organization: req.query.org }] });
      if (user) {
        if (user.employeeId === emp.employeeId && user.organization == req.query.org) {
          console.log('enter 1',user.employeeId,' ',emp.employeeId)
          updateUser = { _id: user._id, organization: user?.organization, groups: user?.groups, currentState: user?.currentState, password: user?.password };
        } else {
          console.log('enter 2')
          updateUser = { _id: user._id, organization: user?.organization, groups: user?.groups, currentState: user?.currentState };
        }
      }

      // create user object to create
      updatedEmpData.push(updateUser ? { ...createUserObject(req.query.org, emp, req.query.role), ...updateUser } : createUserObject(req.query.org, emp, req.query.role));
    }

    // delete existing user data for org
    await User.deleteMany({ organization: req.query.org }).then((response) => console.log({ response }));

    for (value of updatedEmpData) {
      try {
        if (!value.phoneNumber && !value.email) userNotCreated.push(value);
        if (Number(value.phoneNumber) === 0) {
          delete value.phoneNumber;
          if (value.email === "") delete value.email;
          // create new users for org
          const cre = await createUserAfterReplace({ ...value });
          userCreated.push(cre);
        } else {
          const num = value.phoneNumber;
          if (value.email === "") delete value.email;
          // create new users for org
          const cre = await createUserAfterReplace({ ...value, phoneNumber: Number(num) });
          userCreated.push(cre);
        }
      } catch (err) {
        console.log(value, err.message, userNotCreated.length);
        userNotCreated.push(value);
      }
    }
    return res.status(200).send({
      status: "success",
      message: "files uploaded successfully",
      data: { userCreated, userNotCreated },
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ message: error.message });
  }
};
