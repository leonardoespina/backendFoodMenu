// food-menu-api/middleware/auth.js
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt"); // Importar la clave secreta JWT
const { Usuario } = require("../models"); // Importar el modelo Usuario para verificar roles

// Middleware para verificar el token JWT
exports.protect = (req, res, next) => {
  // Obtener el token del encabezado de la petición
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({ message: "No autorizado, no hay token" });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, jwtSecret);

    // Adjuntar el usuario al objeto de solicitud (req)
    // Esto permite acceder al ID y tipo de usuario en las rutas protegidas
    req.user = decoded.user;
    next(); // Pasar al siguiente middleware o controlador de ruta
  } catch (error) {
    console.error("Error de autenticación:", error);
    res.status(401).json({ message: "Token no válido" });
  }
};

// Middleware para autorizar roles específicos
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Si el tipo de usuario no está en los roles permitidos
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        message: `Acceso denegado. El usuario con rol '${req.user.tipo}' no tiene permisos para esta acción.`,
      });
    }
    next();
  };
};
