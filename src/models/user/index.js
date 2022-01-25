const mongoose = require("mongoose");
const UserSchema = require("./schema");
const { initHooks } = require("./hooks");

initHooks(UserSchema);
const User = mongoose.model("user", UserSchema);

module.exports = User;
