// food-menu-api/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models"); // Importar el modelo Usuario
const { jwtSecret, jwtExpiresIn } = require("../config/jwt"); // Importar la configuración JWT

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { nombre, email, telefono, clave, tipo } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ where: { email } });
    if (usuario) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const claveHasheada = await bcrypt.hash(clave, salt);

    // 3. Crear el nuevo usuario
    usuario = await Usuario.create({
      nombre,
      email,
      telefono,
      clave: claveHasheada,
      tipo: tipo || "cliente", // Por defecto, es cliente si no se especifica
    });

    // 4. Generar el Token JWT (opcional al registrar, pero útil para iniciar sesión automáticamente)
    const payload = {
      user: {
        id: usuario.id_usuario,
        tipo: usuario.tipo,
      },
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al registrar usuario." });
  }
};

// Función para iniciar sesión
exports.login = async (req, res) => {
  const { email, clave } = req.body;

  try {
    // 1. Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ message: "Credenciales inválidas." });
    }

    // 2. Comparar la contraseña hasheada
    const isMatch = await bcrypt.compare(clave, usuario.clave);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas." });
    }

    // 3. Generar el Token JWT
    const payload = {
      user: {
        id: usuario.id_usuario,
        tipo: usuario.tipo,
      },
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error del servidor al iniciar sesión." });
  }
};
