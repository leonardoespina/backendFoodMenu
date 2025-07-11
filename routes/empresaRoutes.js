// food-menu-api/routes/empresaRoutes.js
const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const { protect, authorize } = require("../middleware/auth");

// Ruta pública para obtener la información de la empresa
router.get("/", empresaController.getEmpresa);

// Rutas protegidas (solo para administradores)
router.post("/", protect, authorize("admin"), empresaController.createEmpresa); // Solo para la primera vez
router.put(
  "/:id",
  protect,
  authorize("admin"),
  empresaController.updateEmpresa
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  empresaController.deleteEmpresa
); // Usar con mucha precaución

module.exports = router;
