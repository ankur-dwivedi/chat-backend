const { Schema, Types } = require("mongoose");

exports.EmployeeDataSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true, lowercase: true },
});

exports.OtpSchema = new Schema({
  expiry: { type: Date, required: true },
  value: { type: Number, required: true },
});

exports.CurrentStateSchema = new Schema({
  track: { type: Schema.Types.ObjectId, trim: true, ref: "track", required: true },
  level: { type: Schema.Types.ObjectId, trim: true, ref: "level", required: true },
  template: { type: Schema.Types.ObjectId, trim: true, ref: "template", required: true },
  completed: { type: Boolean, default: false, required: true },
});

exports.createGroupFilterQuery = (org, property) => {
  const filterData = property.map((value) => {
    const object = {};
    object[`employeeData.name`] = { $eq: value.name };
    const subQuery = value.value.map((filterValues) => {
      const object = {};
      object[`employeeData.value`] = { $eq: filterValues };
      return { ...object };
    });
    return { ...object, $or: [...subQuery] };
  });
  return { $and: [{ organization: Types.ObjectId(org) }, ...filterData] };
};

exports.createUserIdQuery = (org, employeeIds) => {
  console.log(employeeIds);
  const filterData = employeeIds.map((value) => {
    const object = {};
    object[`_id`] = { $eq: value };
    return { $and: [{ organization: Types.ObjectId(org), ...object }] };
  });
  return { $or: [...filterData] };
};

exports.createUserIdFindQuery = (employeeIds, org) => {
  const filterData = employeeIds.map((value) => {
    const object = {};
    object[`employeeId`] = { $eq: value.employeeId };
    return { $and: [{ organization: Types.ObjectId(org), ...object }] };
  });
  return { $or: [...filterData] };
};
