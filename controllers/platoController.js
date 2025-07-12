// food-menu-api/controllers/platoController.js
const { Plato, Categoria } = require("../models");
const multer = require("multer"); // Importar multer
const path = require("path"); // Para manejar rutas de archivos
const fs = require("fs"); // Para manejar operaciones de sistema de archivos

// --- Configuración de Multer para la subida de imágenes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // La carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único para evitar colisiones
    // Ej: plato-1234567890.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "plato-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("Solo se permiten archivos de imagen (jpg, jpeg, png, gif)"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB por imagen
  },
});

// Middleware para procesar una sola imagen (para 'imagen_plato')
// Usaremos este en la ruta
exports.uploadPlatoImage = upload.single("imagen_plato");

// --- Funciones CRUD existentes, con modificaciones para la imagen ---

// Obtener todos los platos (sin cambios significativos aquí, solo la URL se devolverá)
exports.getAllPlatos = async (req, res) => {
  try {
    const platos = await Plato.findAll({
      include: [{ model: Categoria, attributes: ["nombre"] }],
    });
    res.status(200).json(platos);
  } catch (error) {
    console.error("Error al obtener platos:", error);
    res.status(500).json({ message: "Error del servidor al obtener platos." });
  }
};

// Obtener un plato por ID (sin cambios significativos aquí)
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
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null; // Obtener la URL de la imagen subida

  try {
    const categoria = await Categoria.findByPk(id_categoria);
    if (!categoria) {
      // Si la categoría no existe, eliminar la imagen subida para limpiar
      if (req.file) fs.unlinkSync(req.file.path);
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
      imagen_url, // Guardar la URL de la imagen
    });
    res.status(201).json({
      message: "Plato creado exitosamente.",
      plato: nuevoPlato,
    });
  } catch (error) {
    console.error("Error al crear plato:", error);
    // En caso de error, si se subió un archivo, elimínalo para evitar archivos huérfanos
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Error del servidor al crear plato." });
  }
};

// Actualizar un plato (Solo Admin)
exports.updatePlato = async (req, res) => {
  const { id } = req.params;
  const { id_categoria, nombre, descripcion, precio, disponible } = req.body;
  const nueva_imagen_url = req.file ? `/uploads/${req.file.filename}` : null; // Nueva imagen si se subió

  try {
    const plato = await Plato.findByPk(id);
    if (!plato) {
      if (req.file) fs.unlinkSync(req.file.path); // Eliminar si se subió una imagen para un plato no existente
      return res.status(404).json({ message: "Plato no encontrado." });
    }

    if (id_categoria) {
      const categoria = await Categoria.findByPk(id_categoria);
      if (!categoria) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "La categoría especificada no existe." });
      }
    }

    // Si se subió una nueva imagen, borrar la antigua si existe
    if (nueva_imagen_url && plato.imagen_url) {
      const oldImagePath = path.join(__dirname, "..", plato.imagen_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    plato.id_categoria = id_categoria || plato.id_categoria;
    plato.nombre = nombre || plato.nombre;
    plato.descripcion = descripcion || plato.descripcion;
    plato.precio = precio || plato.precio;
    plato.disponible = disponible !== undefined ? disponible : plato.disponible;
    plato.imagen_url = nueva_imagen_url || plato.imagen_url; // Actualizar con la nueva o mantener la existente

    await plato.save();
    res.status(200).json({
      message: "Plato actualizado exitosamente.",
      plato,
    });
  } catch (error) {
    console.error("Error al actualizar plato:", error);
    if (req.file) fs.unlinkSync(req.file.path); // Eliminar archivo subido en caso de error
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

    // Eliminar la imagen asociada al plato si existe
    if (plato.imagen_url) {
      const imagePath = path.join(__dirname, "..", plato.imagen_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await plato.destroy();
    res.status(200).json({ message: "Plato eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar plato:", error);
    res.status(500).json({ message: "Error del servidor al eliminar plato." });
  }
};
