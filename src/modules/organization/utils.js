const { ROLE } = require('../../models/user/constants');
const { get: getFilterData } = require('../../models/filterData/services');

const userKeys = {
  email: '',
  name: '',
  role: '',
  employeeId: '',
  phoneNumber: 123457,
  employeeData: [],
  password: '',
  groups: [],
  organization: '',
};
exports.createUserObject = (org, userData, role) => {
  userData['employeeData'] = [];
  userData['organization'] = org;
  if (role) userData['role'] = role;
  Object.keys(userData).map((value) => {
    if (!(value in userKeys)) {
      userData['employeeData'].push({
        name: value,
        value: userData[value],
      });
      delete userData[value];
    }
  });
  if (!userData['role']) userData['role'] = ROLE.LEARNER;
  return userData;
};

exports.validateOrgDataSchema = async (firstRow, orgFilterCheck=false, orgId='') => {
  let mandatoryColumns = ['employeeId', 'name', 'phoneNumber', 'email'];
  csvHeaders = Object.keys(firstRow);
  if(orgFilterCheck){
    const orgFilter = (await getFilterData({ organization: orgId})).data
    const mandatoryFilters = orgFilter.map((filter)=>filter.name)
    mandatoryColumns = mandatoryColumns.concat(mandatoryFilters)
  }
  return mandatoryColumns.every((column) => csvHeaders.includes(column));
};

exports.removeDuplicates = async (empData) => {
  const empDataSet = {
    employeeId: new Set(),
    phoneNumber: new Set(),
    email: new Set(),
  };
  const processedEmpData = empData.filter((emp) => {
    if (
      empDataSet.employeeId.has(emp.employeeId) ||
      empDataSet.phoneNumber.has(emp.phoneNumber) ||
      empDataSet.email.has(emp.email)
    ) {
      return false;
    }
    empDataSet.employeeId.add(emp.employeeId);
    empDataSet.phoneNumber.add(emp.phoneNumber);
    empDataSet.email.add(emp.email);
    return true;
  });
  return processedEmpData;
};
