const { Sequelize } = require('sequelize');
require('dotenv').config();

// Créer la connexion à PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Mettre à true pour voir les requêtes SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie avec succès');
    return true;
  } catch (error) {
    console.warn('⚠️ Impossible de se connecter à PostgreSQL pour le moment:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };