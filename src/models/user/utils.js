const { Schema,Types } = require("mongoose");

exports.EmployeeDataSchema = new Schema({
  name: { type: String, required: true},
  value: { type: String, required: true},
});

exports.OtpSchema = new Schema({
  expiry: { type: Date, required: true },
  value: { type: Number, required: true },
});

exports.createGroupFilterQuery = (org,property)=>{
  const filterData=property.map(value=>{
    const object={}
    object[`employeeData.name`]={ $eq: value.name }
    object[`employeeData.value`]={ $eq: value.value }
    return { ...object }
  })
  return{  $and: [{organization:Types.ObjectId(org)},...filterData] }
}
