// food-menu-api/controllers/pedidoController.js
const { Pedido, PedidoPlato, Plato, Usuario } = require("../models");
const { sequelize } = require("sequelize"); // Para transacciones

// Obtener todos los pedidos (Solo Admin)
exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: PedidoPlato,
          include: [{ model: Plato, attributes: ["nombre", "precio"] }], // Incluir detalles del plato
        },
        {
          model: Usuario,
          attributes: ["nombre", "email", "telefono"], // Incluir detalles del usuario si está asociado
        },
      ],
      order: [["fecha", "DESC"]], // Ordenar por fecha, los más recientes primero
    });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error del servidor al obtener pedidos." });
  }
};

// Obtener un pedido por ID (Admin o Cliente dueño del pedido)
exports.getPedidoById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userTipo = req.user.tipo;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: PedidoPlato,
          include: [{ model: Plato, attributes: ["nombre", "precio"] }],
        },
        {
          model: Usuario,
          attributes: ["nombre", "email", "telefono"],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Permitir acceso si es admin o si el usuario es el dueño del pedido
    if (
      userTipo === "admin" ||
      (pedido.id_usuario && pedido.id_usuario === userId)
    ) {
      res.status(200).json(pedido);
    } else {
      res.status(403).json({
        message: "Acceso denegado. No tiene permisos para ver este pedido.",
      });
    }
  } catch (error) {
    console.error("Error al obtener pedido por ID:", error);
    res.status(500).json({ message: "Error del servidor al obtener pedido." });
  }
};

// Crear un nuevo pedido (Cliente o Admin)
// Requiere:
// - `telefono_cliente`: para clientes no registrados o como fallback
// - `id_usuario`: opcional si el cliente está registrado (se tomará de `req.user.id`)
// - `platos`: un array de objetos { id_plato, cantidad }
exports.createPedido = async (req, res) => {
  const { nombre_cliente, telefono_cliente, platos } = req.body;
  const id_usuario = req.user ? req.user.id : null; // Si hay usuario autenticado, usa su ID

  // Validaciones básicas
  if (!telefono_cliente || !platos || platos.length === 0) {
    return res.status(400).json({
      message: "Se requiere teléfono del cliente y al menos un plato.",
    });
  }

  let transaction;
  try {
    transaction = await Pedido.sequelize.transaction(); // Iniciar una transacción

    let totalPedido = 0;
    const pedidoPlatosData = [];

    // Validar platos y calcular el total
    for (const item of platos) {
      const plato = await Plato.findByPk(item.id_plato, { transaction });
      if (!plato || !plato.disponible) {
        await transaction.rollback();
        return res.status(400).json({
          message: `El plato con ID ${item.id_plato} no existe o no está disponible.`,
        });
      }
      if (item.cantidad <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: `La cantidad para el plato con ID ${item.id_plato} debe ser mayor a cero.`,
        });
      }
      const precioUnitario = parseFloat(plato.precio);
      totalPedido += precioUnitario * item.cantidad;
      pedidoPlatosData.push({
        id_plato: item.id_plato,
        cantidad: item.cantidad,
        precio: precioUnitario, // Guardar el precio actual del plato en el momento del pedido
      });
    }

    // Crear el pedido principal
    const nuevoPedido = await Pedido.create(
      {
        id_usuario: id_usuario,
        nombre_cliente:
          nombre_cliente ||
          (id_usuario ? (await Usuario.findByPk(id_usuario)).nombre : null), // Si hay usuario autenticado y no se da nombre_cliente, usar el del usuario
        telefono_cliente,
        total: totalPedido,
        estado: "recibido",
      },
      { transaction }
    );

    // Asociar los platos al pedido
    const pedidosPlatosCreados = pedidoPlatosData.map((item) => ({
      ...item,
      id_pedido: nuevoPedido.id_pedido,
    }));

    await PedidoPlato.bulkCreate(pedidosPlatosCreados, { transaction });

    await transaction.commit(); // Confirmar la transacción

    res.status(201).json({
      message: "Pedido creado exitosamente.",
      pedido: nuevoPedido,
      detalles: pedidosPlatosCreados,
    });
  } catch (error) {
    if (transaction) await transaction.rollback(); // Revertir la transacción en caso de error
    console.error("Error al crear pedido:", error);
    res.status(500).json({ message: "Error del servidor al crear pedido." });
  }
};

// Actualizar el estado o total de un pedido (Solo Admin)
exports.updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado, total } = req.body; // Solo permitimos actualizar estado y total por ahora

  try {
    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    if (estado) {
      // Validar que el estado sea uno de los permitidos
      const estadosValidos = [
        "recibido",
        "preparando",
        "listo",
        "entregado",
        "cancelado",
      ];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: "Estado de pedido inválido." });
      }
      pedido.estado = estado;
    }
    if (total) {
      pedido.total = total; // Podría recalcularse en el backend si se actualizan platos
    }

    await pedido.save();
    res.status(200).json({
      message: "Pedido actualizado exitosamente.",
      pedido,
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al actualizar pedido." });
  }
};

// Eliminar un pedido (Solo Admin - con precaución, también elimina PedidoPlato asociados)
exports.deletePedido = async (req, res) => {
  const { id } = req.params;
  let transaction;
  try {
    transaction = await Pedido.sequelize.transaction();

    const pedido = await Pedido.findByPk(id, { transaction });
    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Eliminar los PedidoPlato asociados primero
    await PedidoPlato.destroy({ where: { id_pedido: id }, transaction });

    // Luego eliminar el Pedido
    await pedido.destroy({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Pedido y sus detalles eliminados exitosamente." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ message: "Error del servidor al eliminar pedido." });
  }
};
