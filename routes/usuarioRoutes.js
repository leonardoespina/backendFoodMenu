// food-menu-api/routes/usuarioRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  activateUsuario,
} = require("../controllers/usuarioController");

router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);
router.put("/activate/:id", activateUsuario);

module.exports = router;
