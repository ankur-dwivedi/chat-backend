const {update,get,create,deleteOrganization} = require("../../models/organization/services");

exports.getOrganizations = async(req,res) => 
    get(req.query)
        .then((organization) => (res.send({
          status: 200,
          success: true,
          data: organization,
        })))

exports.create = async (req, res) =>
  create({ ...req.body})
    .then((organization) => 
      res.send({
        status: 200,
        success: true,
        data: organization,
      })
    )
    .catch((err) => {
      res.status(400).send({ message: `organization already exists` });
    });

exports.deleteOrganization = async (req, res) => 
  deleteOrganization(req.body.id).then((organization) =>
    organization.deletedCount
      ? res.send("Organization deleted")
      : res.send("Organization aleready deleted or doesnt exist")
  );

exports.update = async(req,res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body, updatedAt: new Date() };
  delete updateObject.id;
  const updateOrganization= await update(queryObject, updateObject)
    .then((organization) => ({
      status: 200,
      success: true,
      data: organization,
    }))
    return res.send(updateOrganization);
    
};