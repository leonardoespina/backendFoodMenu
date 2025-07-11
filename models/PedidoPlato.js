// food-menu-api/models/PedidoPlato.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PedidoPlato = sequelize.define(
  "PedidoPlato",
  {
    id_pedido_plato: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_plato: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "pedido_plato",
    timestamps: false,
  }
);

module.exports = PedidoPlato;
