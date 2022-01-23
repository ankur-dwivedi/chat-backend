const { Router } = require("express");
const { getFilterData } = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");

const filterDataRouter = Router();

filterDataRouter.get("/", withAuthUser, getFilterData);

module.exports = filterDataRouter;
