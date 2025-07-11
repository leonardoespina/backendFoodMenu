// food-menu-api/models/index.js
const Categoria = require("./Categoria");
const Empresa = require("./Empresa");
const Pedido = require("./Pedido");
const PedidoPlato = require("./PedidoPlato");
const Plato = require("./Plato");
const Usuario = require("./Usuario");

// Definir asociaciones

// Un Plato pertenece a una Categoria
Plato.belongsTo(Categoria, {
  foreignKey: "id_categoria",
  targetKey: "id_categoria",
});
// Una Categoria tiene muchos Platos
Categoria.hasMany(Plato, {
  foreignKey: "id_categoria",
  sourceKey: "id_categoria",
});

// Un Pedido pertenece a un Usuario (opcional)
Pedido.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  targetKey: "id_usuario",
});
// Un Usuario tiene muchos Pedidos
Usuario.hasMany(Pedido, {
  foreignKey: "id_usuario",
  sourceKey: "id_usuario",
});

// Un PedidoPlato pertenece a un Pedido
PedidoPlato.belongsTo(Pedido, {
  foreignKey: "id_pedido",
  targetKey: "id_pedido",
});
// Un Pedido tiene muchos PedidoPlato
Pedido.hasMany(PedidoPlato, {
  foreignKey: "id_pedido",
  sourceKey: "id_pedido",
});

// Un PedidoPlato pertenece a un Plato
PedidoPlato.belongsTo(Plato, {
  foreignKey: "id_plato",
  targetKey: "id_plato",
});
// Un Plato tiene muchos PedidoPlato
Plato.hasMany(PedidoPlato, {
  foreignKey: "id_plato",
  sourceKey: "id_plato",
});

module.exports = {
  Categoria,
  Empresa,
  Pedido,
  PedidoPlato,
  Plato,
  Usuario,
};
