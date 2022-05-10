const applicant_model = require("../../models/applicant/index");
const { uploadFiles } = require(".././../libs/aws/upload");

exports.addApplicant = async (req, res) => {
  try {
    await applicant_model.create(req.body);
    return res.status(201).json({
      status: "success",
      message: `successfully saved the data in db`,
    });
  } catch (err) {
    // console.log(err);
    // console.log(err.message);
    // if (err.code === 11000) {
    //   res.status(409).json({
    //     status: "failed",
    //     message: `Duplicate Email Address`,
    //   });
    //   return;
    // }
    res.status(406).json({
      status: "failed",
      message: `err.name : ${err.name}, err.message:${err.message}`,
    });
  }
};
exports.uploadResume = async (req, res) => {
  try {
    const { files } = req;
    console.log({ files });
    if (!files.length) res.status(400).send("No file uploaded.");
    const finalbucket = `${process.env.AWS_BUCKET_NAME}` + "/resumes";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    return res.send({
      status: 200,
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `invalid file` });
  }
};

exports.getApplicant = async (req,res)=>{
  try {
    let applicantData = await applicant_model.find({},{__v:0}).lean();
    return res.status(200).json({
      success:true,
      status: 200,
      data: applicantData,
    });
  } catch (err) {
    res.status(404).json({
      success: "failed",
      status:404,
      message: `err.name : ${err.name}, err.message:${err.message}`,
    });
  }
}
