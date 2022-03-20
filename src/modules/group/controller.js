const { get, create, deleteGroup, update } = require("../../models/group/services");
const { removeTrackGroupId } = require("../../models/Track/services");
const {
  getGroupEmployee,
  addGroupId,
  updateUserByIds,
  findIdByEmloyeeId,
  findByGroupId,
  removeGroupId,
} = require("../../models/user/services");
const { createGroupFilterQuery } = require("../../models/user/utils");
const { csvToJson, csvToJsonByStream } = require("../../utils/general");
const { uploadFiles } = require(".././../libs/aws/upload");

exports.getGroups = async (req, res) =>
  get({ ...req.query, createdBy: req.user._id }).then((group) =>
    res.send({
      status: 200,
      success: true,
      data: group,
    })
  );

exports.create = async (req, res) => {
  try {
    const group = await create({ ...req.body, createdBy: req.user._id }).then((group) => group);
    const employees = await getGroupEmployee(req.body.organization, req.body.properties);
    const employeeIds = employees.map((value) => value._id);
    await update({ $and: [{ _id: group._id }] }, { employees: employeeIds, updatedAt: new Date() });
    await addGroupId(createGroupFilterQuery(req.body.organization, req.body.properties), group._id);
    res.send({
      status: 200,
      success: true,
      data: { group },
    });
  } catch (error) {
    console.log(error.message);
    if (error.message.indexOf("name_1") !== -1)
      return res.status(200).json({
        status: "failed",
        message: `Group Name needs to be unique`,
      });
    return res.status(400).send({ message: `Group already exists` });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    // const groupUserId = groupUsers.reduce((ids, data) => [...ids, data._id], []);
    await removeGroupId({ groupId: req.body.id });
    //remove group id from track
    await removeTrackGroupId({ groupId: req.body.id });

    const group = await deleteGroup(req.body.id);
    return group.deletedCount
      ? res.send({
          status: 200,
          success: true,
          data: "Group deleted",
        })
      : res.status(400).send("Group aleready deleted or doesnt exist");
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `group deleted` });
  }
};
exports.createGroupEmployee = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/employee-data";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);
    let employeeIds = await findIdByEmloyeeId(employeeData, req.user.organization);
    const group = await create({ ...req.body, employees: employeeIds, createdBy: req.user._id });
    await updateUserByIds(req.user.organization, employeeIds, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    if (error.message.indexOf("name_1") !== -1)
      return res.status(200).json({
        status: "failed",
        message: `Group Name needs to be unique`,
      });
    res.status(400).send({ message: `group already exists` });
  }
};

exports.countEmpInCsv = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");
    const employeeData = await csvToJsonByStream(files[0].path);
    return res.send({
      status: 200,
      success: true,
      data: employeeData.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `no employee data found` });
  }
};

exports.createGpByEmpList = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const group = await create({ ...req.body, employees: employeeId, createdBy: req.user._id });
    await updateUserByIds(req.body.organization, employeeId, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    if (error.message.indexOf("name_1") !== -1)
      return res.status(200).json({
        status: "failed",
        message: `Group Name needs to be unique`,
      });
    res.status(400).send({ message: `group already exists` });
  }
};
