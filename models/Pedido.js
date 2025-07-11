// food-menu-api/models/Pedido.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pedido = sequelize.define(
  "Pedido",
  {
    id_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si el cliente no está registrado
    },
    nombre_cliente: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefono_cliente: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM(
        "recibido",
        "preparando",
        "listo",
        "entregado",
        "cancelado"
      ),
      defaultValue: "recibido",
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "pedido",
    timestamps: false,
  }
);

module.exports = Pedido;
