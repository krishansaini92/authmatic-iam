const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const addRequestId = require('express-request-id');
const { server, logging } = require('config');
const db = require('./db');
const routes = require('./routes/index');
const decodeJwtToken = require('./lib/decode-jwt-token');
const handleError = require('./lib/errors/handle-error');
const logger = require('./services/logger');

const app = express();

if (logging.get('console.isEnabled')) {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(addRequestId({ attributeName: 'requestId' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin:
      server.get('corsWhitelist').length === 0
        ? '*' // eslint-disable-next-line security/detect-non-literal-regexp
        : server.get('corsWhitelist').map((x) => new RegExp(x))
}));

app.use(async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const accessToken = req.headers.authorization.replace('Bearer ', '');
      req.accessToken = accessToken;
      req.auth = await decodeJwtToken(accessToken);
    } catch (e) {
      res.status(401).json({ statusCode: 401, error: 'Authentication failed' });
    }
  }
  next();
});

app.use(async (req, res, next) => {
  req.logger = logger.child({
    requestId: req.requestId
  });
  next();
});

app.use('/', routes);

app.use((err, req, res, next) => {
  let error = { statusCode: 500, error: 'Internal Server Error' };
  try {
    error = handleError(err.message);
    res.status(error.statusCode).json(error);
  } catch (_) {
    res.status(500).json(error);
  }

  req.logger.error('API Error', { error });
  next();
});

app.listen(server.get('port'), async () => {
  await db.connect();
  logger.info(`App started on port ${server.get('port')}`);
});

module.exports = app;
