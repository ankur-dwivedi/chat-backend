const { get } = require('../../models/filterData/services');
const { countEmployeeInOrg } = require('../../models/user/services');

exports.getFilterData = async (req, res) =>
  get({ organization: req.user.organization }).then(async (filterData) =>
    res.send({
      status: 200,
      success: true,
      data: {
        ...JSON.parse(JSON.stringify(filterData)),
        totalEmployees: await countEmployeeInOrg({ organization: req.user.organization }),
      },
    })
  );
// api for count of total employees and updated at for hand picked learners
exports.getTotalEmplyees = async (req, res) =>
  get({ organization: req.user.organization }).then(async (filterData) =>
    res.send({
      status: 200,
      success: true,
      data: {
        createdAt: filterData.createdAt,
        updatedAt: filterData.updatedAt,
        totalEmployees: await countEmployeeInOrg({ organization: req.user.organization }),
      },
    })
  );
