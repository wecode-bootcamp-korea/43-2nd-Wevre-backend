require('dotenv').config();

const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const morgan = require('morgan');

const route = require('./api/routes');
const { globalErrorHandler } = require('./api/utils/error');

const createApp = (app) => {
  const app = express();
  const wsInstance = expressWs(app);

  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(route);

  app.all('*', (req, res, next) => {
    const err = new Error(`Can't fine ${req.originalUrl} on this server!`);

    err.statusCode = 404;

    next(err);
  });

  app.use(globalErrorHandler);

  return app;
};

module.exports = { createApp };
