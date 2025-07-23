// food-menu-api/controllers/categoriaController.js
const { Categoria } = require("../models");
const getQueryParams = require("../utils/queryFeatures");

// Obtener todas las categorías con paginación, búsqueda y ordenamiento
exports.getAllCategorias = async (req, res) => {
  try {
    // Campos en los que se puede aplicar la búsqueda por texto
    const searchableFields = ["nombre"];

    // Obtener las opciones de consulta
    let queryOptions = getQueryParams(req.query, searchableFields);

    // Asegurarse de que solo se devuelvan categorías con status true
    queryOptions.where = {
      ...queryOptions.where,
      status: true,
    };

    // Consulta las categorías con las opciones generadas
    const categorias = await Categoria.findAll(queryOptions);

    // Contar el total de elementos activos que coinciden con los filtros
    const totalCount = await Categoria.count({ where: queryOptions.where });

    // Calcular la página actual (si se usa paginación)
    const currentPage =
      queryOptions.offset && queryOptions.limit
        ? Math.floor(queryOptions.offset / queryOptions.limit) + 1
        : 1;

    res.status(200).json({
      success: true,
      total: totalCount,
      page: currentPage,
      limit: queryOptions.limit,
      count: categorias.length,
      data: categorias,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener categorías.",
      error: error.message,
    });
  }
};

// Obtener una categoría por ID (solo si está activa)
exports.getCategoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findOne({
      where: {
        id_categoria: id,
        status: true,
      },
    });

    if (!categoria) {
      return res
        .status(404)
        .json({ message: "Categoría no encontrada o inactiva." });
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

// "Eliminar" una categoría (Solo Admin) - Cambia status a false
exports.deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    // En lugar de destruir, cambiamos el status a false
    categoria.status = false;
    await categoria.save();

    res.status(200).json({
      message: "Categoría desactivada exitosamente.",
      categoria: {
        id_categoria: categoria.id_categoria,
        nombre: categoria.nombre,
        status: categoria.status,
      },
    });
  } catch (error) {
    console.error("Error al desactivar categoría:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al desactivar categoría." });
  }
};

// Opcional: Endpoint para reactivar una categoría
exports.activateCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    categoria.status = true;
    await categoria.save();

    res.status(200).json({
      message: "Categoría reactivada exitosamente.",
      categoria: {
        id_categoria: categoria.id_categoria,
        nombre: categoria.nombre,
        status: categoria.status,
      },
    });
  } catch (error) {
    console.error("Error al reactivar categoría:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al reactivar categoría." });
  }
};
