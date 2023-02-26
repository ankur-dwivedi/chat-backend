const expressJwt = require('express-jwt');
const User = require('../../models/user');
const { createUnauthorizedError,} = require('../../utils/general');

const verifyAccessToken = expressJwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ['HS256'],
});


const assocAuthUser = (req, res, next) =>
  User.findById(req.user.userId) //.populate('organization')
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError('User not found'));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));



const withAuthUser = [verifyAccessToken, assocAuthUser];


module.exports = {
  verifyAccessToken,
  assocAuthUser,
  withAuthUser,
};
