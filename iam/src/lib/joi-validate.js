const joiFailurePrettier = (error) => {
  let customErrorMessage = '';
  if (
    error.details[0].message.indexOf('[') > -1
    && error.details[0].message.indexOf('pattern') === -1
  ) {
    customErrorMessage = error.details[0].message.substr(error.details[0].message.indexOf('['));
  } else {
    customErrorMessage = error.details[0].message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, '');
  customErrorMessage = customErrorMessage.replace('[', '');
  customErrorMessage = customErrorMessage.replace(']', '');

  throw new Error(customErrorMessage);
};

module.exports = {
  joiFailurePrettier
};
