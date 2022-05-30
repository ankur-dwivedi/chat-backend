const {
  update,
  get,
  create,
  deleteOrganization,
  getRestrictedInfo,
} = require("../../models/organization/services");
const {
  create: userCreate,
  countEmployeeInOrg,
  findIdByEmloyeeId
} = require("../../models/user/services");
const { uploadFiles } = require(".././../libs/aws/upload");
const { csvToJson } = require("../../utils/general");
const { createUserObject } = require("./utils");

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

exports.deleteOrganization = async (req, res) =>
  deleteOrganization(req.body.id).then((organization) =>
    organization.deletedCount
      ? res.send("Organization deleted")
      : res.send("Organization aleready deleted or doesnt exist")
  );

exports.update = async (req, res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body, updatedAt: new Date() };
  delete updateObject.id;
  const updateOrganization = await update(queryObject, updateObject).then(
    (organization) => ({
      status: 200,
      success: true,
      data: organization,
    })
  );
  return res.send(updateOrganization);
};

exports.uploadLogo = async function (req, res) {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");

    let finalbucket =
      `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/logo";
    let uploadedFiles = await uploadFiles(finalbucket, files);
    const queryObject = { $and: [{ _id: req.query.org }] };
    const updateObject = {
      logo: uploadedFiles[0].Location,
      updatedAt: new Date(),
    };
    delete updateObject.id;
    await update(queryObject, updateObject).then(
      (organization) => organization
    );
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
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` +
      "/" +
      `${req.query.org}` +
      "/employee-data";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);
    const updatedData = employeeData.map((value) =>
      createUserObject(req.query.org, value, req.query.role)
    );
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
    const restrictedData = await getRestrictedInfo(req.user.organization).then(
      async (organization) => {
        return {
          updatedAt: organization.updatedAt,
          totalEmployees: await countEmployeeInOrg({
            organization: organization._id,
          }),
        };
      }
    );
    return res.send({
      status: 200,
      success: true,
      data: restrictedData,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.addUsersBulk = async (req, res) => {
  console.log('api')
  try {
    const { files } = req;
    console.log("files",req)
    const org = req.body.org ? req.body.org : req.user.organization;
    if (!files.length) {res.status(400).send("No file uploaded.")};

    //saving csv to AWS
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` +
      "/" +
      `${org}` +
      "/employee-data";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);

    // check for right file type
    if (!employeeData.length || !employeeData[0].employeeId)
      {return res.status(400).send({ message: `Invalid file format` });}

    const updatedData = employeeData.map((value) =>
      createUserObject(req.query.org, value, req.query.role)
    );
    const userNotCreated = [],
      userCreated = [];

    //updating Org update time
    const orgQueryObject = { $and: [{ _id: org }] };
    const orgUpdateObject = {
        updatedAt: new Date(),
      };
      await update(orgQueryObject, orgUpdateObject).then(
        (organization) => organization
      );

    // let employeeExistence = await findIdByEmloyeeId(value?.employeeId, org);


    for (value of updatedData) {
      // if (employeeExistence) {
        try {
          if (Number(value.phoneNumber) === 0) {
            delete value.phoneNumber;
            if (value.email === "") delete value.email;
            const createdUser = await userCreate({ ...value });
            userCreated.push(createdUser);
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
      // else userNotCreated.push(value)
    }

    return res.status(200).send({
      status: "success",
      message: "files uploaded successfully",
      data: { userCreated, userNotCreated },
    });
    // const employeeIds = employeeData.map((data) => data.employeeId);
    // const employeIdNotFound = await checkEmpIdDontExsist({
    //   employeeIds,
    //   organization: org,
    // });
    // if (employeIdNotFound.length) {}
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
