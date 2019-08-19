module.exports = (auth, roles) => {
  if (!auth || !roles || !Array.isArray(roles)) {
    throw new Error('AUTHENTICATION_FAILED');
  }

  let isAuthorized = false;
  roles.some((role) => {
    // eslint-disable-next-line security/detect-object-injection
    if (auth[role] && auth[role].id) {
      isAuthorized = true;

      return true;
    }

    return false;
  });

  if (!isAuthorized) {
    throw new Error('AUTHENTICATION_FAILED');
  }

  return isAuthorized;
};
