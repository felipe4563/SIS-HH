import { QrBanecoService } from '../services/qrBanecoService.js';
import db from '../config/db.js';

/**
 * Iniciar proceso de pago (una sola reserva)
 */
export const iniciarPago = async (req, res) => {
  const { id_reserva } = req.body;

  try {
    const [reservas] = await db.query(
      `SELECT r.*, c.correo, c.nombre, c.apellido,
              h.numero as numero_habitacion,
              t.nombre as tipo_habitacion
       FROM reserva r
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_reserva = ?`,
      [id_reserva]
    );

    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const reserva = reservas[0];

    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({
        message: 'Esta reserva ya ha sido procesada o confirmada'
      });
    }

    if (req.usuario.id_cliente && req.usuario.id_cliente !== reserva.id_cliente) {
      return res.status(403).json({
        message: 'No tienes permiso para procesar esta reserva'
      });
    }

    const descripcion = `Reserva #${id_reserva} - ${reserva.tipo_habitacion} Hab. ${reserva.numero_habitacion}`;

    console.log('📋 Generando QR de pago para reserva:', {
      id_reserva,
      cliente: `${reserva.nombre} ${reserva.apellido}`,
      monto: reserva.total
    });

    const resultado = await QrBanecoService.generarQR({
      transactionId: id_reserva,
      monto: reserva.total,
      descripcion,
    });

    const [resultPago] = await db.query(
      `INSERT INTO pago (id_reserva, monto, metodo_pago, estado_pago, transaccion_id, datos_transaccion, fecha_expiracion)
       VALUES (?, ?, 'qr', 'pendiente', ?, ?, ?)`,
      [
        id_reserva,
        reserva.total,
        resultado.qrId,
        JSON.stringify({ qrId: resultado.qrId }),
        resultado.fechaExpiracion,
      ]
    );

    console.log(`💳 QR generado - ID Pago: ${resultPago.insertId}, ID Reserva: ${id_reserva}, qrId: ${resultado.qrId}`);

    res.json({
      success: true,
      qrImage: resultado.qrImage,
      qrId: resultado.qrId,
      fecha_expiracion: resultado.fechaExpiracion,
      id_pago: resultPago.insertId,
      id_reserva,
      monto: reserva.total,
    });

  } catch (error) {
    console.error('❌ Error al iniciar pago:', error);
    res.status(500).json({
      message: error.message || 'Error al procesar el pago'
    });
  }
};

/**
 * Iniciar pago único para múltiples reservas (carrito) — un solo QR por el
 * total combinado, referenciado desde la primera reserva del carrito.
 */
export const iniciarPagoMultiple = async (req, res) => {
  const { ids_reserva } = req.body;

  if (!Array.isArray(ids_reserva) || ids_reserva.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de ids_reserva' });
  }

  try {
    const placeholders = ids_reserva.map(() => '?').join(',');
    const [reservas] = await db.query(
      `SELECT r.*, c.correo, c.nombre, c.apellido,
              h.numero AS numero_habitacion,
              t.nombre AS tipo_habitacion
       FROM reserva r
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_reserva IN (${placeholders})`,
      ids_reserva
    );

    if (reservas.length !== ids_reserva.length) {
      return res.status(404).json({ message: 'Alguna reserva no fue encontrada' });
    }

    const noDisponibles = reservas.filter((r) => r.estado !== 'pendiente');
    if (noDisponibles.length > 0) {
      return res.status(400).json({ message: 'Algunas reservas ya fueron procesadas' });
    }

    if (req.usuario.id_cliente && req.usuario.id_cliente !== reservas[0].id_cliente) {
      return res.status(403).json({ message: 'No tienes permiso para procesar estas reservas' });
    }

    const montoTotal = reservas.reduce((sum, r) => sum + parseFloat(r.total), 0);
    const cliente = reservas[0];

    const habitacionesStr = reservas.map((r) => `Hab. ${r.numero_habitacion}`).join(', ');
    const descripcion = `${ids_reserva.length} habitaciones (${habitacionesStr}) - ${cliente.nombre} ${cliente.apellido}`;

    console.log('🛒 Generando QR de pago múltiple:', {
      ids_reserva,
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      monto_total: montoTotal,
    });

    const resultado = await QrBanecoService.generarQR({
      transactionId: ids_reserva[0],
      monto: montoTotal.toFixed(2),
      descripcion,
    });

    const [resultPago] = await db.query(
      `INSERT INTO pago (id_reserva, monto, metodo_pago, estado_pago, transaccion_id, datos_transaccion, fecha_expiracion)
       VALUES (?, ?, 'qr', 'pendiente', ?, ?, ?)`,
      [
        ids_reserva[0],
        montoTotal.toFixed(2),
        resultado.qrId,
        JSON.stringify({ qrId: resultado.qrId, ids_reserva_todas: ids_reserva }),
        resultado.fechaExpiracion,
      ]
    );

    console.log(`💳 QR múltiple generado - ID Pago: ${resultPago.insertId}, Reservas: ${ids_reserva.join(', ')}`);

    res.json({
      success: true,
      qrImage: resultado.qrImage,
      qrId: resultado.qrId,
      fecha_expiracion: resultado.fechaExpiracion,
      id_pago: resultPago.insertId,
      ids_reserva,
      monto_total: montoTotal,
    });
  } catch (error) {
    console.error('❌ Error al iniciar pago múltiple:', error);
    res.status(500).json({ message: error.message || 'Error al procesar el pago' });
  }
};

/**
 * Verificar estado de pago de una reserva. Si el pago sigue pendiente,
 * consulta al banco (o expira localmente) antes de responder.
 */
export const verificarEstadoPago = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const [pagos] = await db.query(
      `SELECT p.*, r.estado as estado_reserva, r.total as monto_reserva
       FROM pago p
       INNER JOIN reserva r ON p.id_reserva = r.id_reserva
       WHERE p.id_reserva = ?
       ORDER BY p.fecha_pago DESC, p.id_pago DESC
       LIMIT 1`,
      [id_reserva]
    );

    if (pagos.length === 0) {
      return res.status(404).json({
        message: 'No se encontró información de pago para esta reserva'
      });
    }

    const pago = pagos[0];

    if (pago.metodo_pago === 'qr' && pago.estado_pago === 'pendiente') {
      const yaVencio = pago.fecha_expiracion && new Date(pago.fecha_expiracion) < new Date();

      if (yaVencio) {
        console.log(`⏰ QR expirado para pago #${pago.id_pago}, anulando...`);
        await QrBanecoService.cancelarQR(pago.transaccion_id);
        await db.query(`UPDATE pago SET estado_pago = 'expirado' WHERE id_pago = ?`, [pago.id_pago]);
        pago.estado_pago = 'expirado';
      } else {
        const estadoQr = await QrBanecoService.consultarEstado(pago.transaccion_id);

        if (estadoQr.statusQrCode === 1) {
          let idsReserva = [Number(id_reserva)];
          if (pago.datos_transaccion) {
            try {
              const datos = JSON.parse(pago.datos_transaccion);
              if (Array.isArray(datos.ids_reserva_todas) && datos.ids_reserva_todas.length > 0) {
                idsReserva = datos.ids_reserva_todas;
              }
            } catch (e) {
              console.warn('No se pudo parsear datos_transaccion, usando solo reserva primaria');
            }
          }

          const placeholdersReserva = idsReserva.map(() => '?').join(',');
          await db.query(
            `UPDATE reserva SET estado = 'confirmada' WHERE id_reserva IN (${placeholdersReserva})`,
            idsReserva
          );
          await db.query(
            `UPDATE pago SET estado_pago = 'aprobado', fecha_pago = NOW() WHERE id_pago = ?`,
            [pago.id_pago]
          );

          console.log(`✅ Pago #${pago.id_pago} aprobado - Reservas confirmadas: ${idsReserva.join(', ')}`);

          pago.estado_pago = 'aprobado';
          pago.estado_reserva = 'confirmada';
        } else if (estadoQr.statusQrCode === 9) {
          await db.query(`UPDATE pago SET estado_pago = 'expirado' WHERE id_pago = ?`, [pago.id_pago]);
          pago.estado_pago = 'expirado';
        }
      }
    }

    res.json(pago);

  } catch (error) {
    console.error('❌ Error al verificar estado:', error);
    res.status(500).json({
      message: 'Error al verificar estado del pago'
    });
  }
};
