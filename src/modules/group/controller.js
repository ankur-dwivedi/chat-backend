const { get, create, deleteGroup, update } = require('../../models/group/services');
const { removeTrackGroupId } = require('../../models/Track/services');
const {
  getGroupEmployee,
  addGroupId,
  updateUserByIds,
  findIdByEmloyeeId,
  findByGroupId,
  removeGroupId,
} = require('../../models/user/services');
const User = require('../../models/user/services');
const { createGroupFilterQuery } = require('../../models/user/utils');
const { csvToJson, csvToJsonByStream } = require('../../utils/general');
const { uploadFiles } = require('.././../libs/aws/upload');

exports.getGroups = async (req, res) =>
  get({ ...req.query, createdBy: req.user._id }).then((group) =>
    res.send({
      status: 200,
      success: true,
      data: group,
    })
  );

exports.getGroupById = async (req, res) =>
  get({ id: req.query.id, createdBy: req.user._id }).then((group) =>
    res.send({
      status: 200,
      success: true,
      data: group,
    })
  );

exports.create = async (req, res) => {
  try {
    const group = await create({
      ...req.body,
      createdBy: req.user._id,
      organization: req.user.organization,
    }).then((group) => group);
    let employees = [];
    if (
      req.body.properties.length === 1 &&
      req.body.properties[0].name === 'All Employees' &&
      req.body.properties[0].value[0] === 'All Employees'
    ) {
      //fetching employees from the organization then adding it into the groups
      employees = await User.getEmpByOrg({ organization: req.user.organization });
      const employeeIds = employees.map((value) => value._id);
      //updating group schema
      await update({ $and: [{ _id: group._id }] }, { employees: employeeIds });
      const temp = employeeIds.map((data) => {
        return { _id: data };
      });
      //adding groupId inside user schema
      await addGroupId({ $or: temp }, group._id);
      return res.send({
        status: 200,
        success: true,
        data: { group },
      });
    } else {
      //fetching employees from userSchema
      employees = await getGroupEmployee(req.user.organization, req.body.properties);
      const employeeIds = employees.map((value) => value._id);
      await update({ $and: [{ _id: group._id }] }, { employees: employeeIds });
      await addGroupId(
        createGroupFilterQuery(req.user.organization, req.body.properties),
        group._id
      );
      return res.send({
        status: 200,
        success: true,
        data: { group },
      });
    }
  } catch (error) {
    console.log(error.message);
    if (error.message.indexOf('name_1') !== -1)
      return res.status(406).json({
        status: 'failed',
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
          data: 'Group deleted',
        })
      : res.status(400).send('Group aleready deleted or doesnt exist');
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `group deleted` });
  }
};
exports.createGroupEmployee = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send('No file uploaded.');
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` + '/' + `${req.query.org}` + '/employee-data';
    const uploadedFiles = await uploadFiles(finalbucket, files);
    const employeeData = await csvToJson(uploadedFiles[0].Location);
    let employeeIds = await findIdByEmloyeeId(employeeData, req.user.organization);
    if (!employeeData.length || !employeeData[0].employeeId)
      return res.status(400).send({ message: `Invalid file format` });
    const employeeId = employeeData.map((data) => data.employeeId);
    const employeIdNotFound = await checkEmpIdDontExsist({
      employeeId,
      organization: req.user.organization,
    });
    if (employeIdNotFound.length)
      return res.status(400).send({ message: `employee not found`, data: employeIdNotFound });
    const group = await create({
      ...req.body,
      employees: employeeIds,
      createdBy: req.user._id,
      organization: req.user.organization,
    });
    await updateUserByIds(req.user.organization, employeeIds, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    if (error.message.indexOf('name_1') !== -1)
      return res.status(406).json({
        status: 'failed',
        message: `Group Name needs to be unique`,
      });
    res.status(400).send({ message: `group already exists` });
  }
};

exports.countEmpInCsv = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) return res.status(400).send('No file uploaded.');
    const employeeData = await csvToJsonByStream(files[0].path);
    if (!employeeData.length || !employeeData[0].employeeId)
      return res.status(406).send({ message: `Invalid file format` });
    const employeeId = employeeData.map((data) => data.employeeId);
    const employeIdNotFound = await checkEmpIdDontExsist({
      employeeId,
      organization: req.user.organization,
    });
    if (employeIdNotFound.length)
      return res.status(406).send({ message: `employee not found`, data: employeIdNotFound });
    return res.send({
      status: 200,
      success: true,
      data: employeeData.length,
    });
  } catch (error) {
    console.log(error);
    res.status(406).send({ message: `no employee data found` });
  }
};

exports.createGpByEmpList = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const group = await create({
      ...req.body,
      employees: employeeId,
      createdBy: req.user._id,
      organization: req.user.organization,
    });
    await updateUserByIds(req.user.organization, employeeId, group._id);
    return res.send({
      status: 200,
      success: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    if (error.message.indexOf('name_1') !== -1)
      return res.status(406).json({
        status: 'failed',
        message: `Group Name needs to be unique`,
      });
    res.status(400).send({ message: `group already exists` });
  }
};

const checkEmpIdDontExsist = async ({ employeeId, organization }) => {
  const employeIdNotFound = [];
  let emp = employeeId.map(async (id) => {
    const empData = await User.getEmpBempIdOrg({
      employeeId: id,
      organization,
    });
    if (!empData) employeIdNotFound.push(id);
    return id;
  });
  emp = await Promise.all(emp);
  return employeIdNotFound;
};

exports.update = async (req, res) => {
  try {
    const group = await get({ id: req.body.id, createdBy: req.user._id });
    const old = group.employees.map((data) => data._id.toString());
    console.log(group);
    if (!group) return res.status(400).send({ message: `Invalid group id` });
    if (req.body.employees && req.body.employees.length) {
      if (old && old.length) {
        let empIdTobeRemoved = old.filter(
          (data) => !new Set(req.body.employees).has(data.toString())
        );
        if (empIdTobeRemoved.length)
          await User.removeGroupIdByEmpId({
            groupId: req.body.id,
            employeeId: empIdTobeRemoved,
          });
      }
      const empIdTobeAdded = req.body.employees.filter((data) => !new Set(old).has(data));
      if (empIdTobeAdded.length)
        await updateUserByIds(req.user.organization, empIdTobeAdded, req.body.id);
    }
    const queryObject = { $and: [{ _id: req.body.id }] };
    const updateObject = { ...req.body };
    delete updateObject.id;
    const updateGroup = await update(queryObject, updateObject).then((user) => ({
      status: 200,
      success: true,
      data: 'Group updated successfully',
    }));
    return res.send(updateGroup);
  } catch (error) {
    console.log(error);
    if (error.message.indexOf('name_1') !== -1)
      return res.status(406).json({
        status: 'failed',
        message: `Group Name needs to be unique`,
      });
    res.status(400).send({ message: error.message });
  }
};
