const {get,create,deleteTemplate} = require("../../models/template/services");
const { uploadFiles } = require(".././../libs/aws/upload")

exports.getTemplates = async(req,res) => 
    get(req.query)
        .then((template) => (res.send({
          status: 200,
          success: true,
          data: template,
        })))

exports.create = async (req, res) =>{
  try{
    const template=await create({ ...req.body})
    res.send({
      status: 200,
      success: true,
      data: template,
    })
  }
  catch(error){
    console.log(error)
    res.status(400).send({ message: `invalid template` });
  }
  }

exports.deleteTemplate = async (req, res) => 
  deleteTemplate(req.body.id).then((template) =>
    template.deletedCount
      ? res.send("Template deleted")
      : res.send("Template aleready deleted or doesnt exist")
  );


  exports.uploadTemplateMedia = async (req, res) =>{
    try{
      const { files} = req
       if (!files.length) res.status(400).send('No file uploaded.')
      const finalbucket = `${process.env.AWS_BUCKET_NAME}` +"/" +`${req.query.org}`+`${req.query.track}`+`${req.query.level}`+"/template"
      const uploadedFiles = await uploadFiles(finalbucket, files)
      return res.send({
        status: 200,
        success: true,
        data: uploadedFiles,
      })
    }
    catch(error){
      console.log(error)
      res.status(400).send({ message: `invalid file` });
    }
    }