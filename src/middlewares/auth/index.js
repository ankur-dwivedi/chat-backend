const expressJwt = require("express-jwt");
const User = require("../../models/user");
const { createUnauthorizedError } = require("../../utils/general");
const { ROLE_ENUM } = require("../../models/user/constants");

const verifyAuthToken = expressJwt({
  secret: "testing",
  algorithms: ["HS256"],
});

//-----added by rahul
const saveLastRoleStatus = async (req,res,next) => {
  let lastRole = req.body.lastRole;
  let userData = req.user;
  let fetchUserData = await User.findOne({_id:userData._id}).lean()
  if(fetchUserData===null){
    return res.status(200).json({'status':'failed','message':'please send a valid token / user data not present in db'})
  }else{
    if(ROLE_ENUM.includes(lastRole)){
      fetchUserData.lastRole = lastRole
      let updatedData = await User.findOne({_id:userData._id}).updateOne(fetchUserData)
      if(updatedData.n == 1 && updatedData.ok == 1 && updatedData.nModified == 1){
       return next()
      }
      return res.status(200).json({'status':'failed','message':'something went wrong while updating db please contact admin'})
    }
    return res.status(200).json({'status':'failed','message':'please send a valid user role'})  
  }
}
//------end 

const assocAuthUser = (req, res, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

 
const assocAuthOtherUser = (req, res, next) =>
User.findById(req.user.userId)
  .then((user) => {
    if (!user) {
      res.send(createUnauthorizedError("User not found"));
    } else {
      req.user = user;
      next();
    }
  })
  .catch((error) => res.send(createUnauthorizedError(error)));
 
const isAdmin = (req, _, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("Not Authorized"));
      } else if (user.role !== "admin") {
        res.send(createUnauthorizedError("Not Authorized"));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

/**
 * withAuthUser :: [Middleware]
 * Verify auth token and assoc user document to request
 */
const withAuthUser = [verifyAuthToken, assocAuthUser];

/**
 * withAdminAuthUser :: [Middleware]
 * Verify auth token and check user role
 */
const withAdminAuthUser = [verifyAuthToken, isAdmin];

/**
 * withOptionalAuthUser :: [Middleware]
 * Get user object if exists - other ways assoc empty object
 */
const withOptionalAuthUser = [
  ...withAuthUser,
  (error, req, res, next) => {
    if (error.status === 401) {
      req.user = {};
      next();
    } else {
      next(error);
    }
  },
];

module.exports = {
  verifyAuthToken,
  assocAuthUser,
  isAdmin,
  withAuthUser,
  withAdminAuthUser,
  withOptionalAuthUser,
  saveLastRoleStatus
};
