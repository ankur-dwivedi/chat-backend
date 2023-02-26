const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');
const { errorHandlerMiddleware } = require('./middlewares/error');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/v1', cors(), router);
app.use(errorHandlerMiddleware);

exports.app = app;
