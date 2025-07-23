// food-menu-api/models/Categoria.js
module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define("Categoria", {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Plato, {
      foreignKey: "id_categoria",
    });
  };

  return Categoria;
};
