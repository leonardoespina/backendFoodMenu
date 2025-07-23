module.exports = (sequelize, DataTypes) => {
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
        allowNull: true,
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

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      targetKey: "id_usuario",
    });
  };

  return Pedido;
};
