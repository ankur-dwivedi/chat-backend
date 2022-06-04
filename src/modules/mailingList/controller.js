// api to create new row in mailing list table
const mailingList_model = require('../../models/mailingList/index');
exports.createMailingRecord = async (req, res) => {
  try {
    await mailingList_model.create(req.body);
    return res.status(201).json({
      status: 'success',
      message: `successfully saved the data in db`,
    });
  } catch (err) {
    console.log(err);
    console.log(err.message);
    if (err.code === 11000) {
      res.status(409).json({
        status: 'failed',
        message: `Duplicate Email Address`,
      });
      return;
    }
    res.status(406).json({
      status: 'failed',
      message: `err.name : ${err.name}, err.message:${err.message}`,
    });
  }
};

exports.getMailingList = async (req, res) => {
  try {
    // this returns the list of subscribers
    let subscribersData = await mailingList_model.find({}, { __v: 0 }).lean();
    return res.status(200).json({
      success: true,
      status: 200,
      data: subscribersData,
    });
  } catch (err) {
    res.status(404).json({
      success: 'failed',
      status: 404,
      message: `err.name : ${err.name}, err.message:${err.message}`,
    });
  }
};
