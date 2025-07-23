// utils/queryFeatures.js (CORREGIDO)
const { Op } = require("sequelize");

module.exports = (queryParams, searchableFields) => {
  const options = {
    where: {},
    order: [],
    limit: undefined, // Inicializar como undefined
    offset: undefined, // Inicializar como undefined
  };

  // Filtrado (ej. por categoria_id)
  if (queryParams.categoria_id) {
    options.where.id_categoria = queryParams.categoria_id;
  }

  // Búsqueda
  if (queryParams.search && searchableFields && searchableFields.length > 0) {
    const searchConditions = searchableFields.map((field) => ({
      [field]: { [Op.like]: `%${queryParams.search}%` },
    }));
    options.where[Op.or] = searchConditions;
  }

  // Paginación - CORRECTAMENTE ASIGNANDO LIMIT/OFFSET COMO OPCIONES DE NIVEL SUPERIOR
  if (queryParams.limit) {
    options.limit = parseInt(queryParams.limit, 10); // CORRECTO: Asignar a la propiedad 'limit' de nivel superior
  }
  if (queryParams.offset) {
    options.offset = parseInt(queryParams.offset, 10); // CORRECTO: Asignar a la propiedad 'offset' de nivel superior
  }

  // Ordenación
  if (queryParams.sortBy) {
    const [field, direction] = queryParams.sortBy.split(":");
    options.order.push([field, direction.toUpperCase()]);
  }

  return options;
};
