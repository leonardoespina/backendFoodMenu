// food-menu-api/routes/categoriaRoutes.js
const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");
const { protect, authorize } = require("../middleware/auth");

// Rutas públicas
router.get("/", categoriaController.getAllCategorias);
router.get("/:id", categoriaController.getCategoriaById);

// Rutas protegidas (solo admin)
router.post(
  "/",
  protect,
  authorize("admin"),
  categoriaController.createCategoria
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  categoriaController.updateCategoria
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  categoriaController.deleteCategoria
);

// Opcional: Ruta para reactivar categoría
router.patch(
  "/:id/activate",
  protect,
  authorize("admin"),
  categoriaController.activateCategoria
);

module.exports = router;
