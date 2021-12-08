const {get,create,deleteGroup} = require("../../models/group/services");

exports.getGroups = async(req,res) => 
    get(req.query)
        .then((group) => (res.send({
          status: 200,
          success: true,
          data: group,
        })))

exports.create = async (req, res) =>
  create({ ...req.body})
    .then((group) => 
      res.send({
        status: 200,
        success: true,
        data: group,
      })
    )
    .catch((err) => {
      res.status(400).send({ message: `group already exists` });
    });

exports.deleteGroup = async (req, res) => 
  deleteGroup(req.body.id).then((group) =>
    group.deletedCount
      ? res.send("Group deleted")
      : res.send("Group aleready deleted or doesnt exist")
  );