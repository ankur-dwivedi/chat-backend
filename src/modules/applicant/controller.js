// api to create new row in mailing list table
const applicant_model = require("../../models/mailingList/index");
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
