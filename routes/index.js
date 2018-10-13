const express = require('express');
const auth = require('./utils/auth');
const loginService = require('./services/loginService');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

/* POST for user login attempt. */
router.post('/login', (req, res) => {
  return loginService.attemptLogin(req, res);
});

// router.get('/draftresults/:draftId', (req, res) => {
//   res.render('draftresults');
// });

router.get('/draftroom', auth.isAuthenticated, (req, res) => {
  res.render('index', { title: 'Some Dumb Basketball Fantasy Drafter' });
});

router.get('/main', auth.isAuthenticated, (req, res) => {
  res.render('main', { title: 'Draft Home | Drafter' });
});

/* GET home page. */
router.get('/', auth.isAuthenticated, (req, res) => {
  res.redirect('draftroom');
});

module.exports = router;
