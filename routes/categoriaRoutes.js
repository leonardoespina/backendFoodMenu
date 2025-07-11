// food-menu-api/routes/categoriaRoutes.js
const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");
const { protect, authorize } = require("../middleware/auth"); // Importar middlewares

// Rutas públicas (cualquier usuario, incluso no autenticado, puede ver las categorías)
router.get("/", categoriaController.getAllCategorias);
router.get("/:id", categoriaController.getCategoriaById);

// Rutas protegidas (solo para administradores)
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

module.exports = router;
