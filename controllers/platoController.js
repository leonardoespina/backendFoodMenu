// food-menu-api/controllers/platoController.js
const { Plato, Categoria } = require("../models"); // Importar Categoria para la asociación

// Obtener todos los platos
exports.getAllPlatos = async (req, res) => {
  try {
    const platos = await Plato.findAll({
      include: [{ model: Categoria, attributes: ["nombre"] }], // Incluir el nombre de la categoría
    });
    res.status(200).json(platos);
  } catch (error) {
    console.error("Error al obtener platos:", error);
    res.status(500).json({ message: "Error del servidor al obtener platos." });
  }
};

// Obtener un plato por ID
exports.getPlatoById = async (req, res) => {
  const { id } = req.params;
  try {
    const plato = await Plato.findByPk(id, {
      include: [{ model: Categoria, attributes: ["nombre"] }],
    });
    if (!plato) {
      return res.status(404).json({ message: "Plato no encontrado." });
    }
    res.status(200).json(plato);
  } catch (error) {
    console.error("Error al obtener plato por ID:", error);
    res.status(500).json({ message: "Error del servidor al obtener plato." });
  }
};

// Crear un nuevo plato (Solo Admin)
exports.createPlato = async (req, res) => {
  const { id_categoria, nombre, descripcion, precio, disponible } = req.body;
  try {
    // Verificar si la categoría existe
    const categoria = await Categoria.findByPk(id_categoria);
    if (!categoria) {
      return res
        .status(400)
        .json({ message: "La categoría especificada no existe." });
    }

    const nuevoPlato = await Plato.create({
      id_categoria,
      nombre,
      descripcion,
      precio,
      disponible,
    });
    res.status(201).json({
      message: "Plato creado exitosamente.",
      plato: nuevoPlato,
    });
  } catch (error) {
    console.error("Error al crear plato:", error);
    res.status(500).json({ message: "Error del servidor al crear plato." });
  }
};

// Actualizar un plato (Solo Admin)
exports.updatePlato = async (req, res) => {
  const { id } = req.params;
  const { id_categoria, nombre, descripcion, precio, disponible } = req.body;
  try {
    const plato = await Plato.findByPk(id);
    if (!plato) {
      return res.status(404).json({ message: "Plato no encontrado." });
    }

    // Verificar si la nueva categoría existe, si se proporciona
    if (id_categoria) {
      const categoria = await Categoria.findByPk(id_categoria);
      if (!categoria) {
        return res
          .status(400)
          .json({ message: "La categoría especificada no existe." });
      }
    }

    plato.id_categoria = id_categoria || plato.id_categoria;
    plato.nombre = nombre || plato.nombre;
    plato.descripcion = descripcion || plato.descripcion;
    plato.precio = precio || plato.precio;
    plato.disponible = disponible !== undefined ? disponible : plato.disponible;

    await plato.save();
    res.status(200).json({
      message: "Plato actualizado exitosamente.",
      plato,
    });
  } catch (error) {
    console.error("Error al actualizar plato:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al actualizar plato." });
  }
};

// Eliminar un plato (Solo Admin)
exports.deletePlato = async (req, res) => {
  const { id } = req.params;
  try {
    const plato = await Plato.findByPk(id);
    if (!plato) {
      return res.status(404).json({ message: "Plato no encontrado." });
    }
    await plato.destroy();
    res.status(200).json({ message: "Plato eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar plato:", error);
    res.status(500).json({ message: "Error del servidor al eliminar plato." });
  }
};
