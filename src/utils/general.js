var AWS = require("aws-sdk");
const csv = require("csvtojson");
const request = require("request");
const jwt = require("jsonwebtoken");
const httpErrors = require("httperrors");

exports.generateAuthToken = (userId) =>
  jwt.sign({ userId }, "testing");

exports.createUnauthorizedError = (error = "Unauthorized") =>
  httpErrors(401, error);

// exports.sendSns = async (message, number) => {
//   let subject = "SRILANKA";
//   var params = {
//     Message: message,
//     PhoneNumber: "+" + number,
//     MessageAttributes: {
//       "AWS.SNS.SMS.SenderID": {
//         DataType: "String",
//         StringValue: subject,
//       },
//     },
//   };

//   var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
//     .publish(params)
//     .promise();

//   return publishTextPromise;
// };



exports.csvToJson = async (csvUrl) => {
  let jsonArray = []
  await csv()
    .fromStream(request.get(csvUrl))
    .subscribe((json) => {

      return new Promise((resolve, reject) => {
        jsonArray.push(json)
        resolve()
      })
    });
  return jsonArray
}   
