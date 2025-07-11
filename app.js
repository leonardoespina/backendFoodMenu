// food-menu-api/app.js
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const sequelize = require("./config/database");
const models = require("./models");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const platoRoutes = require("./routes/platoRoutes");
const empresaRoutes = require("./routes/empresaRoutes"); // Nueva
const pedidoRoutes = require("./routes/pedidoRoutes"); // Nueva

// Middleware para parsear JSON
app.use(express.json());

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
app.use("/api/empresa", empresaRoutes); // Prefijo '/api/empresa'
app.use("/api/pedidos", pedidoRoutes); // Prefijo '/api/pedidos'

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});
