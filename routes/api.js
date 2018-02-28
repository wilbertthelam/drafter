const express = require('express');
const db = require('mssql');
const poolConfig = require('./utils/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('API for Drafter.');
});

/* GET list of all players for a userId */
router.get('/players/id/:userId', (req, res) => {
  const userId = req.params.userId;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    return connection.query`SELECT * FROM players WHERE id = ${userId}`;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of all players that match name */
router.get('/players/name/:playerSearchString', (req, res) => {
  const playerSearchString = `%${req.params.playerSearchString}%`;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    return connection.query`
      SELECT * FROM players_rankings
      WHERE player_name LIKE ${playerSearchString}
      ORDER BY rank
    `;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of all players by filter */
router.get('/players/position/:position', (req, res) => {
  const position = `%${req.params.position}%`;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    return connection.query`
      SELECT * FROM players_rankings
      WHERE positions LIKE ${position}
      ORDER BY rank
    `;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of all players */
router.get('/players', (req, res) => {
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    return connection.query`SELECT * FROM players_rankings ORDER BY rank`;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* POST group of players */
router.post('/players', (req, res) => {
  res.json({ success: true });
});

/* GET list of all players */
router.get('/users', (req, res) => {
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    return connection.query`SELECT * FROM users`;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

module.exports = router;
