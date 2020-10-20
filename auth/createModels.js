
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('config');
const DSNParser = require('dsn-parser');
const logger = require('./logger');

function getSequelize() {
  const dsn = new DSNParser(process.env.DB_CONNECTION);
  const dsnConfig = dsn.getParts();

  console.log(dsnConfig)

  const logging =
    !process.env.SQL_LOGGING || process.env.SQL_LOGGING !== 'false';

  // Make a connection pool
  const sequelize = new Sequelize(
    dsnConfig.database,
    dsnConfig.user,
    dsnConfig.password,
    {
      host: dsnConfig.host,
      port: dsnConfig.port,
      // If logging isn't explicitly disabled, log all SQL requests at
      // the "debug" level.
      logging: logging ? mesg => logger.debug(mesg) : false,

      pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialect: 'postgres',
    },
  );
  return sequelize;
}

module.exports.sequelize = getSequelize();

module.exports.createModels = function createModels(dirname) {
  const db = {};

  const logging =
    !process.env.SQL_LOGGING || process.env.SQL_LOGGING !== 'false';

  // Make a connection pool
  const sequelize = getSequelize();
  console.log("SEQUELIZE: " + sequelize)
  // Import all the models
  fs.readdirSync(dirname)
    .filter(file => file.charAt(0).toUpperCase() === file.charAt(0))
    .forEach(file => {
      const model = require(path.join(dirname, file))(sequelize, Sequelize.DataTypes)
      //const model = sequelize.import(path.join(dirname, file));
      db[model.name] = model;
    });

  // Associate them with the database
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  // Connect to the database
  db.sequelize
    .authenticate()
    .then(() => {
      if (logging) {
        logger.info({ database: 'Connected to Database' });
      }
    })
    .catch(err => {
      if (!config.useSQL) {
        logger.warning({ database: 'Not connecting to database' });
      } else {
        // If we can't connect at first - fail hard
        logger.error({ database: 'Failed to Connect to Database' });
        logger.error(err);
        process.exit(1);
      }
    });

  return db;
};
