const { Router } = require("express");
const {
  create,
  getOrganizations,
  deleteOrganization,
  update,
  uploadLogo,
  uploadEmployeeData,
  getRestrictedData,
} = require("./controller");
const { validate } = require("../../middlewares/schema");
const {
  createOrganizationContract,
  editOrganizationContract,
  deleteContract,
} = require("./contract");
const { withAdminAccess } = require("../../middlewares/auth");
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

const organizationRouter = Router();

organizationRouter.get("/", getOrganizations);
organizationRouter.post("/", validate(createOrganizationContract), create);
organizationRouter.delete("/", validate(deleteContract), deleteOrganization);
organizationRouter.patch("/", validate(editOrganizationContract), update);
organizationRouter.post("/upload-logo", upload.array("files"), uploadLogo);
organizationRouter.post(
  "/upload-employee-data",
  upload.array("files"),
  uploadEmployeeData
);
organizationRouter.get("/restricted-data", withAdminAccess, getRestrictedData);

module.exports = organizationRouter;
