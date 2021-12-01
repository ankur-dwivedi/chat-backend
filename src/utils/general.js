const jwt = require("jsonwebtoken");
const httpErrors = require("httperrors");

exports.generateAuthToken = (userId) =>
  jwt.sign({ userId }, "testing");

exports.createUnauthorizedError = (error = "Unauthorized") =>
  httpErrors(401, error);