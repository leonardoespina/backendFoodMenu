// food-menu-api/controllers/usuarioController.js
const { Usuario } = require("../models");
const getQueryParams = require("../utils/queryFeatures");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios activos con paginación, búsqueda y ordenamiento
exports.getAllUsuarios = async (req, res) => {
  try {
    // Campos en los que se puede aplicar la búsqueda por texto
    const searchableFields = ["nombre", "email"];

    // Obtener las opciones de consulta
    let queryOptions = getQueryParams(req.query, searchableFields);

    // Asegurarse de que solo se devuelvan usuarios con status true
    queryOptions.where = {
      ...queryOptions.where,
      status: true,
    };

    // Consulta los usuarios con las opciones generadas
    const usuarios = await Usuario.findAll(queryOptions);

    // Contar el total de elementos activos que coinciden con los filtros
    const totalCount = await Usuario.count({ where: queryOptions.where });

    // Calcular la página actual (si se usa paginación)
    const currentPage =
      queryOptions.offset && queryOptions.limit
        ? Math.floor(queryOptions.offset / queryOptions.limit) + 1
        : 1;

    res.status(200).json({
      success: true,
      total: totalCount,
      page: currentPage,
      limit: queryOptions.limit,
      count: usuarios.length,
      data: usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener usuarios.",
      error: error.message,
    });
  }
};

// Obtener un usuario por ID (solo si está activo)
exports.getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findOne({
      where: {
        id_usuario: id,
        status: true,
      },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado o inactivo." });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    res.status(500).json({ message: "Error del servidor al obtener usuario." });
  }
};

// Crear un nuevo usuario (Solo Admin)
exports.createUsuario = async (req, res) => {
  const { nombre, email, clave, rol } = req.body;
  try {
    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado. k",
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const claveHasheada = await bcrypt.hash(clave, salt);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      clave: claveHasheada,
      rol,
    });
    res.status(201).json({
      message: "Usuario creado exitosamente.",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    // Manejo de errores de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación.",
        errors: messages,
      });
    }
    res.status(500).json({ message: "Error del servidor al crear usuario." });
  }
};

// Actualizar un usuario (Solo Admin)
exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, clave, rol } = req.body;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    usuario.nombre = nombre;
    usuario.email = email;
    if (clave) {
      const salt = await bcrypt.genSalt(10);
      usuario.clave = await bcrypt.hash(clave, salt);
    }
    usuario.rol = rol;
    await usuario.save();
    res.status(200).json({
      message: "Usuario actualizado exitosamente.",
      usuario,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al actualizar usuario." });
  }
};

// "Eliminar" un usuario (Solo Admin) - Cambia status a false
exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // En lugar de destruir, cambiamos el status a false
    usuario.status = false;
    await usuario.save();

    res.status(200).json({
      message: "Usuario desactivado exitosamente.",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        status: usuario.status,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al desactivar usuario." });
  }
};

// Opcional: Endpoint para reactivar un usuario
exports.activateUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    usuario.status = true;
    await usuario.save();

    res.status(200).json({
      message: "Usuario reactivado exitosamente.",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        status: usuario.status,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al reactivar usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al reactivar usuario." });
  }
};
