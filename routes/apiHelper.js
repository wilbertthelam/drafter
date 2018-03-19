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

const getUsers = (draftId) => {
  return new Promise((resolve, reject) => {
    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      if (draftId === undefined || draftId === null) {
        return connection.query`SELECT * FROM users`;
      }
      return connection.query`SELECT * FROM users
        INNER JOIN users_instances ON users.id = users_instances.user_id
        WHERE users_instances.draft_id = ${draftId}`;
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
