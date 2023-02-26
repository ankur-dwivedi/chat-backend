const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandlerMiddleware } = require('./middlewares/error');
const passport = require('./libs/passport');

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use('/api/v1', cors(), router);
app.use(errorHandlerMiddleware);

exports.app = app;
