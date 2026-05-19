const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let sequelize;

// Fallback to SQLite if MySQL env variables aren't properly configured or for dev convenience
const useSqlite = process.env.USE_SQLITE === 'true' || !process.env.DB_PASSWORD;

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../campuslink.sqlite'),
    logging: false
  });
  console.log('Using SQLite database for CampusLink.');
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
  console.log('Using MySQL database for CampusLink.');
}

module.exports = sequelize;
