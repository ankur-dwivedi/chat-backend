const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = () =>
  mongoose
    .connect("mongodb+srv://admin:admin@cluster0.3vv6n.mongodb.net/cascade", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then(() => console.log("connected to mongodb"))
    .catch(console.error);

module.exports = connectToDB;
