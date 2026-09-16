import express from 'express';
import { iniciarPago, iniciarPagoMultiple, verificarEstadoPago } from '../controllers/pago.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Iniciar proceso de pago (requiere autenticación)
router.post('/iniciar', authMiddleware, iniciarPago);

// Iniciar pago único para múltiples reservas del carrito
router.post('/iniciar-multiple', authMiddleware, iniciarPagoMultiple);

// Verificar estado del pago
router.get('/estado/:id_reserva', verificarEstadoPago);

export default router;
