/**
 * loginService controls authentication related route services
 */

const db = require('mssql');
const poolConfig = require('./../utils/db');

const attemptLogin = (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;

    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      return connection.query`
            SELECT * FROM users
            WHERE email = ${email} AND password = ${password};`;
    }).then((response) => {
      const data = response.recordset;
      // If no user match, return to login with error
      if (!data || data.length < 1) {
        return res.render('login', { valid: false });
      }
      req.session.userId = data[0].id;
      req.session.isAdmin = data[0].isAdmin;
      return res.redirect('/');
    }).catch((error) => {
      return res.render('login', { valid: false, error });
    });
  } else {
    return res.render('login', { valid: false, error: 'Could not send data or no data was provided.' });
  }
};

module.exports = {
  attemptLogin,
};
