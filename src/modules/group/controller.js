const {get,create,deleteGroup,update} = require("../../models/group/services");
const {getGroupEmployee,addGroupId} = require("../../models/user/services");
const { createGroupFilterQuery } = require("../../models/user/utils");

exports.getGroups = async(req,res) => 
    get(req.query)
        .then((group) => (res.send({
          status: 200,
          success: true,
          data: group,
        })))

exports.create = async (req, res) =>{
  try{
    const group=await create({ ...req.body})
    .then((group) => group)
    const employees=await getGroupEmployee(req.body.organization,req.body.properties)
    const employeeIds=employees.map(value=>value._id)
    await update({ $and: [{ _id: group._id}] },{ employees:employeeIds, updatedAt: new Date() })
    await addGroupId(createGroupFilterQuery(req.body.organization,req.body.properties),group._id)
    res.send({
      status: 200,
      success: true,
      data: {group},
    })
  }
  catch(error){
    console.log(error)
    res.status(400).send({ message: `group already exists` });
  }
  }

exports.deleteGroup = async (req, res) => 
  deleteGroup(req.body.id).then((group) =>
    group.deletedCount
      ? res.send("Group deleted")
      : res.send("Group aleready deleted or doesnt exist")
  );