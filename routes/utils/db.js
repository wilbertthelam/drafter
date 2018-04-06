/**
 * DB configuration
 * TODO: Migrate to secure area (populate on build?)
 */

const poolConfig = {
  user: 'drafter_admin',
  password: 'Ichiro51',
  server: 'drafter.database.windows.net',
  port: 1433,
  database: 'drafter_db',
  options: {
    encrypt: true, // Needed for Azure access
  },
};

module.exports = poolConfig;
