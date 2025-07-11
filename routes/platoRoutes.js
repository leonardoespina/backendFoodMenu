// food-menu-api/routes/platoRoutes.js
const express = require("express");
const router = express.Router();
const platoController = require("../controllers/platoController");
const { protect, authorize } = require("../middleware/auth"); // Importar middlewares

// Rutas públicas (cualquier usuario, incluso no autenticado, puede ver los platos)
router.get("/", platoController.getAllPlatos);
router.get("/:id", platoController.getPlatoById);

// Rutas protegidas (solo para administradores)
router.post("/", protect, authorize("admin"), platoController.createPlato);
router.put("/:id", protect, authorize("admin"), platoController.updatePlato);
router.delete("/:id", protect, authorize("admin"), platoController.deletePlato);

module.exports = router;
