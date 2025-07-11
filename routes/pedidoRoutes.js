// food-menu-api/routes/pedidoRoutes.js
const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const { protect, authorize } = require("../middleware/auth");

// Rutas protegidas por autenticación
router.post("/", pedidoController.createPedido); // Clientes y Admin pueden crear pedidos
router.get("/:id", protect, pedidoController.getPedidoById); // Clientes pueden ver sus pedidos, Admin todos

// Rutas protegidas (solo para administradores)
router.get("/", protect, authorize("admin"), pedidoController.getAllPedidos);
router.put("/:id", protect, authorize("admin"), pedidoController.updatePedido);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  pedidoController.deletePedido
);

module.exports = router;
