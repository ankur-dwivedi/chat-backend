const { get, create, deleteGroup, update } = require("../../models/group/services");
const {
  getGroupEmployee,
  addGroupId,
  updateUserByIds,
  findIdByEmloyeeId,
} = require("../../models/user/services");
const { createGroupFilterQuery } = require("../../models/user/utils");
const { csvToJson } = require("../../utils/general");
const { uploadFiles } = require(".././../libs/aws/upload");

exports.getGroups = async (req, res) =>
  get(req.query).then((group) =>
    res.send({
      status: 200,
      success: true,
      data: group,
    })
  );

exports.create = async (req, res) => {
  try {
    const group = await create({ ...req.body }).then((group) => group);
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
    console.log(error);
    res.status(400).send({ message: `group already exists` });
  }
};

exports.deleteGroup = async (req, res) =>
  deleteGroup(req.body.id).then((group) =>
    group.deletedCount
      ? res.send("Group deleted")
      : res.send("Group aleready deleted or doesnt exist")
  );

exports.createGroupEmployee = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` + "/" + `${req.query.org}` + "/employee-data";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);
    let employeeIds = await findIdByEmloyeeId(employeeData, req.body.organization);
    const group = await create({ ...req.body, employees: employeeIds });
    await updateUserByIds(req.body.organization, employeeIds, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `group already exists` });
  }
};

exports.createGpByEmpList = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const group = await create({ ...req.body, employees: employeeId });
    await updateUserByIds(req.body.organization, employeeId, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `group already exists` });
  }
};
