const { Sequelize, DataTypes } = require('sequelize');

const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT;
const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
});

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
connectToDatabase();

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./userModel')(sequelize, Sequelize, DataTypes);
db.userRole = require('./roleModel')(sequelize, Sequelize, DataTypes);
db.status = require('./statusModel')(sequelize, Sequelize, DataTypes);
db.godowns = require('./godownModel')(sequelize, Sequelize, DataTypes);
db.inwards = require('./inwardModel')(sequelize, Sequelize, DataTypes);
db.deliveries = require('./deliveryModel')(sequelize, Sequelize, DataTypes);
db.returns = require('./returnModel')(sequelize, Sequelize, DataTypes);
// db.godownHistory = require('./godownHistoryModel')(sequelize, Sequelize, DataTypes);
db.invoice = require('./invoiceModel')(sequelize, Sequelize, DataTypes);


module.exports = db;