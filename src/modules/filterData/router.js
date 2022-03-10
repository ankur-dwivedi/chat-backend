const { Router } = require("express");
const { getFilterData, getTotalEmplyees } = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");

const filterDataRouter = Router();

filterDataRouter.get("/", withAuthUser, getFilterData);
filterDataRouter.get("/count", withAuthUser, getTotalEmplyees);

module.exports = filterDataRouter;
