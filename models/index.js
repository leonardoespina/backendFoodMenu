// food-menu-api/models/index.js
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Categoria = require("./Categoria")(sequelize, DataTypes);
const Empresa = require("./Empresa")(sequelize, DataTypes);
const Pedido = require("./Pedido")(sequelize, DataTypes);
const PedidoPlato = require("./PedidoPlato")(sequelize, DataTypes);
const Plato = require("./Plato")(sequelize, DataTypes);
const Usuario = require("./Usuario")(sequelize, DataTypes);

const models = {
  Categoria,
  Empresa,
  Pedido,
  PedidoPlato,
  Plato,
  Usuario,
};

// Definir asociaciones
Plato.associate(models);
Categoria.associate(models);
Pedido.associate(models);
PedidoPlato.associate(models);
Usuario.associate(models);

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize: require("sequelize"),
  ...models,
};
