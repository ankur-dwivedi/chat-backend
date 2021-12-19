const {update,get,create,deleteOrganization} = require("../../models/organization/services");
const { uploadFiles } = require(".././../libs/aws/upload")

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

exports.uploadLogo = async function (req, res) {
  try {
     const { files } = req
     if (!files.length) res.status(400).send('No file uploaded.')

     let finalbucket = `${process.env.AWS_BUCKET_NAME}` +"/" +`${req.query.org}`+"/logo"
     let uploadedFiles = await uploadFiles(finalbucket, files)
      const queryObject = { $and: [{ _id: req.query.org }] };
      const updateObject = { logo:uploadedFiles[0].Location, updatedAt: new Date() };
      delete updateObject.id;
      await update(queryObject, updateObject).then((organization) =>organization)
     res.status(200)
        .send({ status: 'success', message: 'files uploaded successfully', uploadedFiles: uploadedFiles })
  } catch (error) {
     throw error
  }
}