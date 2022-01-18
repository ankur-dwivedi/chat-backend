const { Router } = require("express");
const {
  create,
  getGroups,
  deleteGroup,
  createGroupEmployee,
  createGpByEmpList,
} = require("./controller");
const { validate } = require("../../middlewares/schema");
const { createContract, deleteContract, createByEmpListContract } = require("./contract");
const { withAuthUser } = require("../../middlewares/auth");
const multer = require("multer");

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/tmp");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const groupRouter = Router();

groupRouter.get("/", withAuthUser, getGroups);
groupRouter.post("/", withAuthUser, validate(createContract), create);
groupRouter.delete("/", withAuthUser, validate(deleteContract), deleteGroup);
groupRouter.post("/create-custom", withAuthUser, upload.array("files"), createGroupEmployee);
groupRouter.post(
  "/create-by-list",
  withAuthUser,
  validate(createByEmpListContract),
  createGpByEmpList
);

module.exports = groupRouter;
