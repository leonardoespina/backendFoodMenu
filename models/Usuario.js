// food-menu-api/models/Usuario.js
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("Usuario", {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tipo: {
      type: DataTypes.STRING,
      defaultValue: "usuario", // o 'admin'
    },
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Pedido, {
      foreignKey: "id_usuario",
      sourceKey: "id_usuario",
    });
  };

  return Usuario;
};
