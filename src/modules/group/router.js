const { Router } = require("express");
const {create,getGroups,deleteGroup, createGroupEmployee} = require("./controller");
const { validate } = require("../../middlewares/schema");
const {createContract,deleteContract} = require("./contract");
const multer = require('multer')

var upload = multer({
  storage: multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, '/tmp')
      },
      filename: function (req, file, cb) {
          cb(null, file.originalname)
      },
  }),
})

const groupRouter = Router();

groupRouter.get("/", getGroups);
groupRouter.post("/",validate(createContract), create);
groupRouter.delete("/",validate(deleteContract), deleteGroup);
groupRouter.post("/create-custom", upload.array('files'), createGroupEmployee);


module.exports = groupRouter;
