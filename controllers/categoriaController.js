// food-menu-api/controllers/categoriaController.js
const { Categoria } = require("../models");

// Obtener todas las categorías
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener categorías." });
  }
};

// Obtener una categoría por ID
exports.getCategoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    res.status(200).json(categoria);
  } catch (error) {
    console.error("Error al obtener categoría por ID:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener categoría." });
  }
};

// Crear una nueva categoría (Solo Admin)
exports.createCategoria = async (req, res) => {
  const { nombre } = req.body;
  try {
    const nuevaCategoria = await Categoria.create({ nombre });
    res.status(201).json({
      message: "Categoría creada exitosamente.",
      categoria: nuevaCategoria,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: "Error del servidor al crear categoría." });
  }
};

// Actualizar una categoría (Solo Admin)
exports.updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    categoria.nombre = nombre;
    await categoria.save();
    res.status(200).json({
      message: "Categoría actualizada exitosamente.",
      categoria,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al actualizar categoría." });
  }
};

// Eliminar una categoría (Solo Admin)
exports.deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    await categoria.destroy();
    res.status(200).json({ message: "Categoría eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar categoría." });
  }
};
