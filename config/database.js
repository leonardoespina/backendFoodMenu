// food-menu-api/config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // O 'postgres' si usas PostgreSQL
    logging: false, // Desactiva el log de SQL en la consola
    define: {
      timestamps: false, // Desactiva `createdAt` y `updatedAt` por defecto
      freezeTableName: true, // Evita que Sequelize pluralice los nombres de tabla
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Verificar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente. 🌐");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos:", error);
    process.exit(1); // Salir de la aplicación si no se puede conectar
  }
}

testConnection();

module.exports = sequelize;
