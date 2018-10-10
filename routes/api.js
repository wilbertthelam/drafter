const express = require('express');
const db = require('mssql');
const poolConfig = require('./utils/db');
const apiHelper = require('./apiHelper');
const sport = require('./utils/currentSport');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('API for Drafter.');
});

/* GET list of ALL players for a userId */
router.get('/players/id/:userId', (req, res) => {
  const userId = req.params.userId;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    if (sport === "baseball") {
      return connection.query`
        SELECT * FROM players_rankings_full
        WHERE id = ${userId};`;
    } else if (sport === "basketball") {
      return connection.query`
        SELECT * FROM basketball_players_rankings_full
        WHERE id = ${userId};`;
    }
    return undefined;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of ALL players that match name */
router.get('/players/name/:playerSearchString', (req, res) => {
  const playerSearchString = `%${req.params.playerSearchString}%`;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    if (sport === "baseball") {
      return connection.query`
        SELECT * FROM players_rankings_full'
        WHERE player_name LIKE ${playerSearchString}
        ORDER BY rank;`;
    } else if (sport === "basketball") {
      return connection.query`
        SELECT * FROM basketball_players_rankings_full'
        WHERE player_name LIKE ${playerSearchString}
        ORDER BY rank;`;
    }
    return undefined;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of ALL players by filter */
router.get('/players/position/:position', (req, res) => {
  const position = `%${req.params.position}%`;
  new db.ConnectionPool(poolConfig).connect().then((connection) => {
    if (sport === "baseball") {
      return connection.query`
        SELECT * FROM players_rankings_full
        WHERE positions LIKE ${position}
        ORDER BY rank;`;
    } else if (sport === "basketball") {
      return connection.query`
        SELECT * FROM basketball_players_rankings_full
        WHERE positions LIKE ${position}
        ORDER BY rank;`;
    }
    return undefined;
  }).then((response) => {
    const data = response.recordset;
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of ALL players */
router.get('/players', (req, res) => {
  apiHelper.getPlayers().then((data) => {
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

/* GET list of ALL users */
router.get('/users', (req, res) => {
  apiHelper.getUsers().then((data) => {
    return res.json({ data });
  }).catch((error) => {
    return res.json({ error });
  });
});

module.exports = router;
