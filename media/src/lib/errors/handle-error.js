const errorsList = require('./errors.json');

module.exports = (error) => {
  let response = {
    statusCode: 400,
    message: error.message || error,
    error: 'Bad Request'
  };
  // eslint-disable-next-line security/detect-object-injection
  if (errorsList[error] && errorsList[error].message) {
    // eslint-disable-next-line security/detect-object-injection
    response = errorsList[error];
  }

  return response;
};
