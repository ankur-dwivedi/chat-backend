const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
// mongodb://localhost:27017/server
const connectToDB = () =>
    mongoose.connect(process.env.MONGO_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    })
        .then(() => console.log("connected to mongodb"))
        .catch(console.error);

module.exports = connectToDB
