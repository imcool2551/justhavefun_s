const forwardAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('Forward Auth');
    return next();
  }
  return res.status(401).json({
    success: false,
    error_msg: 'Please log in to view the resources',
  });
};

const blockAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('Block Auth');
    return next();
  }

  return res.status(400).json({
    success: false,
    error_msg: 'You need to log out first for this operation',
  });
};

module.exports = {
  forwardAuthenticated,
  blockAuthenticated,
};
