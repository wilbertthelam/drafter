const express = require('express');
const db = require('mssql');
const poolConfig = require('./utils/db');
const auth = require('./utils/auth');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

/* GET users listing. */
router.post('/login', (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;

    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      return connection.query`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
    }).then((response) => {
      const data = response.recordset;
      // If no user match, return to login with error
      if (!data || data.length < 1) {
        return res.render('login', { valid: false });
      }
      req.session.userId = data[0].id;
      return res.redirect('/');
    }).catch((error) => {
      return res.render('login', { valid: false, error });
    });
  } else {
    return res.render('login', { valid: false, error: 'Could not send data or no data was provided.' });
  }
});

router.get('/draftresults/:draftId', (req, res) => {
  res.render('draftresults');
});

router.get('/draftroom', auth.isAuthenticated, (req, res) => {
  res.render('index');
});

/* GET home page. */
router.get('/', auth.isAuthenticated, (req, res) => {
  res.redirect('/draftroom');
});

module.exports = router;
