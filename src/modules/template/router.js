const { Router } = require("express");
const {create,getTemplates,deleteTemplate, uploadTemplateMedia} = require("./controller");
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

const templateRouter = Router();

templateRouter.get("/", getTemplates);
templateRouter.post("/",validate(createContract), create);
templateRouter.delete("/",validate(deleteContract), deleteTemplate);
templateRouter.post("/upload", upload.array('files'), uploadTemplateMedia);


module.exports = templateRouter;
