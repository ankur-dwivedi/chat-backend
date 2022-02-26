const { ROLE } = require("../../models/user/constants");

const userKeys = {
  email: "",
  name: "",
  role: "",
  employeeId: "",
  phoneNumber: 123457,
  employeeData: [],
  password: "",
  groups: [],
  organization: "",
};
exports.createUserObject = (org, userData) => {
  userData["employeeData"] = [];
  userData["organization"] = org;
  Object.keys(userData).map((value) => {
    if (!(value in userKeys)) {
      userData["employeeData"].push({
        name: value,
        value: userData[value],
      });
      delete userData[value];
    }
  });
  if (!userData["role"]) userData["role"] = ROLE.LEARNER;
  return userData;
};
