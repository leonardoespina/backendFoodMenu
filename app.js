// food-menu-api/app.js
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const sequelize = require("./config/database");
const models = require("./models");
const path = require("path"); // Importar path para resolver rutas

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const platoRoutes = require("./routes/platoRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

// Middleware para parsear JSON
app.use(express.json());

// --- Servir archivos estáticos (imágenes) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Las imágenes estarán en http://localhost:3000/uploads/nombre_del_archivo.jpg

// Sincronizar modelos con la base de datos
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Modelos sincronizados con la base de datos. ✨");
  })
  .catch((err) => {
    console.error("Error al sincronizar modelos:", err);
    process.exit(1);
  });

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API del Menú Digital funcionando! 🎉");
});

// Usar rutas
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/platos", platoRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/pedidos", pedidoRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});
