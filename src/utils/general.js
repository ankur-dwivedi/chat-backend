const jwt = require("jsonwebtoken");
const httpErrors = require("httperrors");
const csv = require("csvtojson");
const request = require("request");

exports.generateAuthToken = (userId) =>
  jwt.sign({ userId }, "testing");

exports.createUnauthorizedError = (error = "Unauthorized") =>
  httpErrors(401, error);

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

exports.generateOtp = () => Math.floor(100000 + Math.random() * 900000);
