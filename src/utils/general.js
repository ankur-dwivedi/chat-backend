const jwt = require('jsonwebtoken');
const httpErrors = require('httperrors');

exports.generateAccessToken = (userId) =>
  jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '7d',
  });

exports.createUnauthorizedError = (error = 'Unauthorized') => httpErrors(401, error);