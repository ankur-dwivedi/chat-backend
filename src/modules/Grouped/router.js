const { Router } = require("express");
const groupController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createGroupsContract } = require("./contract")

const groupRouter = Router();

groupRouter.get("/fetchAllGroups",groupController.get.fetchAllGroups)
groupRouter.get("/fetchUserGroups",withAuthUser, groupController.get.fetchUserGroups);
groupRouter.post("/createGroup",validate(createGroupsContract),withAuthUser, groupController.post.createGroups);


module.exports = groupRouter;
