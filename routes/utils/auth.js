/**
 * Authentication checker for routes.
 * If the user currently is logged in and the server is storing the session
 * id, allow user to access the draft client.
 */

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect('/login');
};

module.exports = { isAuthenticated };
