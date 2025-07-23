// food-menu-api/controllers/platoController.js
const { Plato, Categoria } = require("../models");
const multer = require("multer"); // Importar multer
const path = require("path"); // Para manejar rutas de archivos
const fs = require("fs"); // Para manejar operaciones de sistema de archivos
const getQueryParams = require("../utils/queryFeatures"); // Importar la utilidad

// --- Configuración de Multer para la subida de imágenes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurarse de que la carpeta 'uploads' exista. Si no, Multer podría crearla.
    // Aunque se recomienda crearla manualmente o con un script de inicio.
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único para evitar colisiones
    // Ej: plato-1678901234567-987654321.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "plato-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo imágenes (jpg, jpeg, png, gif)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    // Si el archivo no es una imagen, devuelve un error.
    cb(
      new Error("Solo se permiten archivos de imagen (jpg, jpeg, png, gif)"),
      false
    );
  }
};

// Configuración final de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB por imagen
  },
});

// Middleware para procesar una sola imagen con el nombre de campo 'imagen_plato'
exports.uploadPlatoImage = upload.single("imagen_plato");

// --- Funciones CRUD de Plato ---

// Obtener todos los platos (con Paginación, Filtrado, Búsqueda y Ordenación)
exports.getAllPlatos = async (req, res) => {
  try {
    // Campos en los que se puede aplicar la búsqueda por texto
    const searchableFields = ["nombre", "descripcion"];

    // Obtener las opciones de consulta
    let queryOptions = getQueryParams(req.query, searchableFields);

    // Asegurarse de que solo se devuelvan platos con status true
    queryOptions.where = {
      ...queryOptions.where,
    };

    // Filtrar por categoría si se especifica
    if (req.query.id_categoria) {
      queryOptions.where = {
        ...queryOptions.where,
        id_categoria: req.query.id_categoria,
      };
    }

    // Consulta los platos con las opciones generadas
    const platos = await Plato.findAll({
      ...queryOptions,
      include: [{ model: Categoria, attributes: ["nombre"] }],
    });

    // Contar el total de elementos activos que coinciden con los filtros
    const totalCount = await Plato.count({ where: queryOptions.where });

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
      count: platos.length,
      data: platos,
    });
  } catch (error) {
    console.error("Error al obtener platos:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener platos.",
      error: error.message,
    });
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
  // Si se subió un archivo, `req.file` contendrá su información.
  // Construimos la URL de la imagen que se guardará en la base de datos.
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Verificar si la categoría existe
    const categoria = await Categoria.findByPk(id_categoria);
    if (!categoria) {
      // Si la categoría no existe, eliminar la imagen subida para evitar archivos huérfanos
      if (req.file) fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ message: "La categoría especificada no existe." });
    }

    // Crear el nuevo plato en la base de datos
    const nuevoPlato = await Plato.create({
      id_categoria,
      nombre,
      descripcion,
      precio,
      disponible,
      imagen_url, // Guardar la URL de la imagen en la BD
    });

    res.status(201).json({
      message: "Plato creado exitosamente.",
      plato: nuevoPlato,
    });
  } catch (error) {
    console.error("Error al crear plato:", error);
    // En caso de cualquier error durante la creación, eliminar el archivo subido si existe
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Error del servidor al crear plato." });
  }
};

// Actualizar un plato existente (Solo Admin)
exports.updatePlato = async (req, res) => {
  const { id } = req.params;
  const { id_categoria, nombre, descripcion, precio, disponible } = req.body;
  // `nueva_imagen_url` será la URL del nuevo archivo si se subió uno en esta solicitud
  const nueva_imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const plato = await Plato.findByPk(id);
    if (!plato) {
      // Si el plato no existe, eliminar la imagen que quizás se subió para este intento fallido
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Plato no encontrado." });
    }

    // Si se intenta cambiar la categoría, verificar que la nueva categoría exista
    if (id_categoria) {
      const categoria = await Categoria.findByPk(id_categoria);
      if (!categoria) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "La categoría especificada no existe." });
      }
    }

    // Si se subió una nueva imagen Y el plato ya tenía una imagen antigua,
    // eliminar la imagen antigua del servidor para liberar espacio.
    if (nueva_imagen_url && plato.imagen_url) {
      const oldImagePath = path.join(__dirname, "..", plato.imagen_url);
      if (fs.existsSync(oldImagePath)) {
        // Verificar que el archivo realmente existe
        fs.unlinkSync(oldImagePath);
      }
    }

    // Actualizar las propiedades del plato
    plato.id_categoria = id_categoria || plato.id_categoria;
    plato.nombre = nombre || plato.nombre;
    plato.descripcion = descripcion || plato.descripcion;
    plato.precio = precio || plato.precio;
    // `disponible` se maneja con un chequeo explícito porque `false` es un valor válido
    plato.disponible = disponible !== undefined ? disponible : plato.disponible;
    // Si hay una nueva imagen subida, usarla; de lo contrario, mantener la URL existente.
    plato.imagen_url = nueva_imagen_url || plato.imagen_url;

    await plato.save(); // Guardar los cambios en la base de datos
    res.status(200).json({
      message: "Plato actualizado exitosamente.",
      plato,
    });
  } catch (error) {
    console.error("Error al actualizar plato:", error);
    // En caso de error, eliminar el archivo subido para evitar huérfanos
    if (req.file) fs.unlinkSync(req.file.path);
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

    // Si el plato tiene una imagen asociada, eliminar el archivo del servidor
    if (plato.imagen_url) {
      const imagePath = path.join(__dirname, "..", plato.imagen_url);
      if (fs.existsSync(imagePath)) {
        // Verificar que el archivo realmente existe
        fs.unlinkSync(imagePath);
      }
    }

    await plato.destroy(); // Eliminar el plato de la base de datos
    res.status(200).json({ message: "Plato eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar plato:", error);
    res.status(500).json({ message: "Error del servidor al eliminar plato." });
  }
};
