const http = require("http");

const connectToDB = require("./libs/mongoose");
const { app } = require("./app");
const { PORT } = require("./utils/constants");
 
connectToDB();
app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, token"
  );
  
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
  next();
});
const httpServer = http
  .createServer(app)
  .on("error", console.error)
  .listen(PORT, () => console.log(`Server running on Port ${PORT}`));
