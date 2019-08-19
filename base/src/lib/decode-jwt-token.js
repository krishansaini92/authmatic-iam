const jwt = require('jsonwebtoken');
const { session: sessionConfig } = require('config');

module.exports = async (token) => jwt.verify(token, sessionConfig.get('key'));
