module.exports = {
  jwtSecret:
    process.env.JWT_SECRET || "super_secreto_por_defecto_si_no_hay_env",
  jwtExpiresIn: "1h", // Token expira en 1 hora
};
