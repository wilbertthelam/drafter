const db = require('mssql');
const poolConfig = require('./utils/db');

const getPlayers = () => {
  return new Promise((resolve, reject) => {
    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      return connection.query`SELECT * FROM players_rankings_full ORDER BY rank`;
    }).then((response) => {
      const data = response.recordset;
      return resolve(data);
    }).catch((error) => {
      return reject(error);
    });
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      return connection.query`SELECT * FROM users`;
    }).then((response) => {
      const data = response.recordset;
      return resolve(data);
    }).catch((error) => {
      return reject(error);
    });
  });
};

module.exports = {
  getPlayers,
  getUsers,
};
