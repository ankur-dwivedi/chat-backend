const { Router } = require("express");
const {create,getOrganizations,deleteOrganization,update} = require("./controller");
const { validate } = require("../../middlewares/schema");

const {createOrganizationContract,editOrganizationContract,deleteContract} = require("./contract");

const organizationRouter = Router();

organizationRouter.get("/", getOrganizations);
organizationRouter.post("/",validate(createOrganizationContract), create);
organizationRouter.delete("/",validate(deleteContract), deleteOrganization);
organizationRouter.patch("/",validate(editOrganizationContract), update);

module.exports = organizationRouter;
