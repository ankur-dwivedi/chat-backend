const { get } = require("../../models/filterData/services");

exports.getFilterData = async (req, res) =>
  get(req.query).then((filterData) =>
    res.send({
      status: 200,
      success: true,
      data: filterData,
    })
  );
