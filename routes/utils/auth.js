const isAuthenticated = (req, res, next) => {
  console.log('Checking user authentication');
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect('/login');
};

module.exports = { isAuthenticated };
