// food-menu-api/routes/platoRoutes.js
const express = require("express");
const router = express.Router();
const platoController = require("../controllers/platoController");
const { protect, authorize } = require("../middleware/auth");

// Rutas públicas
router.get("/", platoController.getAllPlatos);
router.get("/:id", platoController.getPlatoById);

// Rutas protegidas (solo para administradores)
// AÑADIR platoController.uploadPlatoImage AQUÍ
router.post(
  "/",
  protect,
  authorize("admin"),
  platoController.uploadPlatoImage,
  platoController.createPlato
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  platoController.uploadPlatoImage,
  platoController.updatePlato
);
router.delete("/:id", protect, authorize("admin"), platoController.deletePlato);

module.exports = router;
