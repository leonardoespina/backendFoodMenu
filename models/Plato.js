// food-menu-api/models/Plato.js
module.exports = (sequelize, DataTypes) => {
  const Plato = sequelize.define(
    "Plato",
    {
      id_plato: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      imagen_url: {
        // <-- Nuevo campo para la URL de la imagen
        type: DataTypes.STRING(255),
        allowNull: true, // Puede ser null si no tiene imagen
      },
    },
    {
      tableName: "plato",
      timestamps: false,
    }
  );

  Plato.associate = (models) => {
    Plato.belongsTo(models.Categoria, {
      foreignKey: "id_categoria",
      targetKey: "id_categoria",
    });
  };

  return Plato;
};
