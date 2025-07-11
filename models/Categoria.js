// food-menu-api/models/Categoria.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Categoria = sequelize.define(
  "Categoria",
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "categoria", // Asegúrate de que el nombre de la tabla coincida
    timestamps: false, // No queremos `createdAt` y `updatedAt` para esta tabla
  }
);

module.exports = Categoria;
