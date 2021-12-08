const { Router } = require("express");
const {create,getGroups,deleteGroup} = require("./controller");
const { validate } = require("../../middlewares/schema");

const {createContract,deleteContract} = require("./contract");

const groupRouter = Router();

groupRouter.get("/", getGroups);
groupRouter.post("/",validate(createContract), create);
groupRouter.delete("/",validate(deleteContract), deleteGroup);

module.exports = groupRouter;
