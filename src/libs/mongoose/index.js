const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = () =>
  mongoose
    .connect("mongodb+srv://admin:1HKgUksK7q8QDJdM@cluster0.cibal.mongodb.net/padboat", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then(() => console.log("connected to mongodb"))
    .catch(console.error);

module.exports = connectToDB;
