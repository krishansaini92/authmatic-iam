const jwt = require('jsonwebtoken');
const { session: sessionConfig } = require('config');
const ms = require('ms');

module.exports = (data) => jwt.sign(data, sessionConfig.get('key'), { expiresIn: ms(sessionConfig.refreshTtl) });
