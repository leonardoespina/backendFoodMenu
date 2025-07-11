// food-menu-api/controllers/empresaController.js
const { Empresa } = require("../models");

// Obtener información de la empresa (Pública)
exports.getEmpresa = async (req, res) => {
  try {
    // Generalmente solo hay una entrada para la empresa
    const empresa = await Empresa.findOne();
    if (!empresa) {
      return res
        .status(404)
        .json({ message: "Información de la empresa no encontrada." });
    }
    res.status(200).json(empresa);
  } catch (error) {
    console.error("Error al obtener información de la empresa:", error);
    res.status(500).json({
      message: "Error del servidor al obtener información de la empresa.",
    });
  }
};

// Crear información de la empresa (Solo Admin - debería ser solo una vez)
exports.createEmpresa = async (req, res) => {
  const { nombre, rif, direccion, telefono, correo } = req.body;
  try {
    // Opcional: Verificar si ya existe una empresa para evitar duplicados
    const existingEmpresa = await Empresa.findOne();
    if (existingEmpresa) {
      return res.status(400).json({
        message:
          "Ya existe información de la empresa. Use PUT para actualizar.",
      });
    }

    const nuevaEmpresa = await Empresa.create({
      nombre,
      rif,
      direccion,
      telefono,
      correo,
    });
    res.status(201).json({
      message: "Información de la empresa creada exitosamente.",
      empresa: nuevaEmpresa,
    });
  } catch (error) {
    console.error("Error al crear información de la empresa:", error);
    res.status(500).json({
      message: "Error del servidor al crear información de la empresa.",
    });
  }
};

// Actualizar información de la empresa (Solo Admin)
exports.updateEmpresa = async (req, res) => {
  const { id } = req.params; // Podríamos usar un ID fijo como 1, o buscar la única entrada
  const { nombre, rif, direccion, telefono, correo } = req.body;
  try {
    const empresa = await Empresa.findByPk(id); // O Empresa.findOne()
    if (!empresa) {
      return res
        .status(404)
        .json({ message: "Información de la empresa no encontrada." });
    }

    empresa.nombre = nombre || empresa.nombre;
    empresa.rif = rif || empresa.rif;
    empresa.direccion = direccion || empresa.direccion;
    empresa.telefono = telefono || empresa.telefono;
    empresa.correo = correo || empresa.correo;

    await empresa.save();
    res.status(200).json({
      message: "Información de la empresa actualizada exitosamente.",
      empresa,
    });
  } catch (error) {
    console.error("Error al actualizar información de la empresa:", error);
    res.status(500).json({
      message: "Error del servidor al actualizar información de la empresa.",
    });
  }
};

// Eliminar información de la empresa (Solo Admin - Usar con extrema precaución)
exports.deleteEmpresa = async (req, res) => {
  const { id } = req.params; // Podríamos usar un ID fijo como 1, o buscar la única entrada
  try {
    const empresa = await Empresa.findByPk(id); // O Empresa.findOne()
    if (!empresa) {
      return res
        .status(404)
        .json({ message: "Información de la empresa no encontrada." });
    }
    await empresa.destroy();
    res
      .status(200)
      .json({ message: "Información de la empresa eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar información de la empresa:", error);
    res.status(500).json({
      message: "Error del servidor al eliminar información de la empresa.",
    });
  }
};
