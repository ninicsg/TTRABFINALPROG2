const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
process.env.DB_NAME || 'esmalteriadb',
process.env.DB_USER || 'postgres',
process.env.DB_PASS || 'Caicai@888',
{
host: process.env.DB_HOST || 'localhost',
dialect: 'postgres',
logging: false,
define: { freezeTableName: true }
}
);


module.exports = sequelize;