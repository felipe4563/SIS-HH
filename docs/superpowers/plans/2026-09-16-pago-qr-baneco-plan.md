# Integración de Pagos QR (Banco Económico) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la pasarela Red Enlace por el producto "Pago Simple QR" de Banco Económico (API Market v1.4.0) para cobrar reservas, con confirmación por polling.

**Architecture:** Un nuevo `QrBanecoService` (clase estática, mismo rol que el `RedEnlaceService` que reemplaza) encapsula autenticación, cifrado y llamadas HTTP al banco. El controller `pago.controller.js` reutiliza sus tres endpoints existentes (`iniciar`, `iniciar-multiple`, `estado/:id_reserva`) pero ahora generan/consultan un QR en vez de redirigir a una pasarela externa. El frontend reemplaza la redirección (`window.location.href`) por un modal (`ModalPagoQR`) que muestra la imagen del QR y hace polling a nuestro propio endpoint de estado.

**Tech Stack:** Node.js/Express + mysql2 (backend), React + Vite + Tailwind (frontend), axios para llamadas HTTP al banco.

**Spec:** `docs/superpowers/specs/2026-09-15-pago-qr-baneco-design.md`

## Global Constraints

- Ambiente de certificación del banco: `https://apimktdesa.baneco.com.bo/ApiGateway/` (viene de `BANCO_ECONOMICO_BASE_URL`, sin `/` final en el valor guardado).
- Moneda siempre `BOB`.
- `dueDate` que exige el banco es solo fecha (`yyyy-MM-dd`), sin hora — la expiración real de 20 minutos que mostramos al usuario la controlamos nosotros con `fecha_expiracion` en la tabla `pago`, no con `dueDate`.
- `singleUse: true`, `modifyAmount: false` siempre en `generateQR`.
- El campo `password` que exige `authenticate` debe enviarse ya cifrado con el endpoint de encriptación del banco (no es el password plano).
- `accountCredit` en `generateQR` también debe ir cifrado con el mismo endpoint.
- El endpoint de encriptar/desencriptar del banco es **GET** con query params (`text`, `aesKey`), y devuelve el texto plano (no JSON envuelto).
- Este proyecto no tiene framework de tests automatizados (no hay Jest/Vitest/Mocha instalado). Se sigue el patrón ya existente en `backend/test/` de scripts manuales (`node test/archivo.js`) que llaman a la API real y muestran resultados por consola — usar ese patrón, no introducir un framework nuevo.
- No hay nada en producción todavía: los cambios de esquema de BD se aplican directo al dump versionado, sin migración de compatibilidad.

---

## File Structure

**Backend:**
- Modify: `bd/bd_hostal_nuevo.sql` — nuevo esquema de `pago`
- Modify: `backend/.env.example` — quitar `RED_ENLACE_*`, agregar `BANCO_ECONOMICO_*`
- Create: `backend/services/qrBanecoService.js` — cliente del API del banco
- Create: `backend/test/testQrBaneco.js` — script de verificación manual
- Delete: `backend/test/testRedEnlace.js`
- Modify: `backend/controllers/pago.controller.js` — reescribe `iniciarPago`, `iniciarPagoMultiple`, `verificarEstadoPago`; elimina `webhookRedEnlace`
- Delete: `backend/services/redEnlaceService.js`
- Modify: `backend/routes/pago.routes.js` — elimina la ruta del webhook

**Frontend:**
- Modify: `frontend/src/services/pago.js` — limpieza de parámetro obsoleto
- Create: `frontend/src/pages/Home/ModalPagoQR.jsx` — modal que muestra el QR y hace polling
- Modify: `frontend/src/pages/Home/ModalReserva.jsx` — usa `ModalPagoQR` en vez de redirigir
- Modify: `frontend/src/pages/Home/ModalCarrito.jsx` — ídem, para el pago múltiple
- Modify: `frontend/src/pages/Home/Misreservas.jsx` — ídem, para "Continuar Pago"

(`frontend/src/pages/Home/ModalPreparacionPago.jsx` ya fue eliminado en una sesión anterior — no requiere tarea.)

---

### Task 1: Esquema de base de datos y variables de entorno

**Files:**
- Modify: `bd/bd_hostal_nuevo.sql`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces: columnas `pago.estado_pago`, `pago.transaccion_id`, `pago.datos_transaccion`, `pago.fecha_expiracion`, y el valor `'qr'` en el enum `pago.metodo_pago` — todas las tareas siguientes del backend dependen de que existan.

- [ ] **Step 1: Editar la tabla `pago` en el dump**

En `bd/bd_hostal_nuevo.sql`, reemplazar:

```sql
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

por:

```sql
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo_pago` enum('efectivo','tarjeta','transferencia','qr') DEFAULT 'efectivo',
  `estado_pago` enum('pendiente','aprobado','rechazado','expirado') DEFAULT 'pendiente',
  `transaccion_id` varchar(100) DEFAULT NULL,
  `datos_transaccion` text DEFAULT NULL,
  `fecha_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

- [ ] **Step 2: Actualizar `backend/.env.example`**

Quitar estas líneas:

```
RED_ENLACE_USERNAME=
RED_ENLACE_ACCOUNT_ID=
RED_ENLACE_KEY_WEBSERVICE=
RED_ENLACE_ENVIRONMENT=development  # cambiar a 'production' cuando estés listo
```

Agregar en su lugar:

```
BANCO_ECONOMICO_BASE_URL=https://apimktdesa.baneco.com.bo/ApiGateway
BANCO_ECONOMICO_USER=
BANCO_ECONOMICO_PASSWORD=
BANCO_ECONOMICO_AES_KEY=
BANCO_ECONOMICO_ACCOUNT_CREDIT=
```

- [ ] **Step 3: Aplicar el cambio a la base de datos real**

Esto no se puede automatizar porque no hay conexión a una BD en este entorno. Correr manualmente contra la base de datos de desarrollo (`bd_hostal`):

```sql
ALTER TABLE pago
  MODIFY metodo_pago enum('efectivo','tarjeta','transferencia','qr') DEFAULT 'efectivo',
  ADD estado_pago enum('pendiente','aprobado','rechazado','expirado') DEFAULT 'pendiente',
  ADD transaccion_id varchar(100) DEFAULT NULL,
  ADD datos_transaccion text DEFAULT NULL,
  ADD fecha_expiracion datetime DEFAULT NULL;
```

- [ ] **Step 4: Commit**

```bash
git add "bd/bd_hostal_nuevo.sql" "backend/.env.example"
git commit -m "feat(pago): esquema de BD y variables de entorno para QR Banco Economico"
```

---

### Task 2: Servicio del banco (`qrBanecoService.js`) y script de verificación manual

**Files:**
- Create: `backend/services/qrBanecoService.js`
- Create: `backend/test/testQrBaneco.js`
- Delete: `backend/test/testRedEnlace.js`

**Interfaces:**
- Consumes: `process.env.BANCO_ECONOMICO_BASE_URL/USER/PASSWORD/AES_KEY/ACCOUNT_CREDIT` (de Task 1).
- Produces: `QrBanecoService.generarQR({ transactionId, monto, descripcion }) -> { qrId, qrImage, fechaExpiracion }`, `QrBanecoService.consultarEstado(qrId) -> { statusQrCode, pago }`, `QrBanecoService.cancelarQR(qrId) -> void`. Estas tres firmas las consume el Task 3.

- [ ] **Step 1: Crear `backend/services/qrBanecoService.js`**

```js
import axios from 'axios';

let cachedToken = null;
let tokenExpiresAt = 0;

export class QrBanecoService {
  static getConfig() {
    const baseUrl = (process.env.BANCO_ECONOMICO_BASE_URL || '').replace(/\/$/, '');
    return {
      baseUrl,
      user: process.env.BANCO_ECONOMICO_USER,
      password: process.env.BANCO_ECONOMICO_PASSWORD,
      aesKey: process.env.BANCO_ECONOMICO_AES_KEY,
      accountCredit: process.env.BANCO_ECONOMICO_ACCOUNT_CREDIT,
    };
  }

  /**
   * El banco expone su propio endpoint de cifrado AES-256; no se reimplementa
   * el algoritmo localmente. Es un GET con query params, y devuelve texto plano.
   */
  static async encriptar(texto) {
    const config = this.getConfig();
    const response = await axios.get(`${config.baseUrl}/api/authentication/encrypt`, {
      params: { text: texto, aesKey: config.aesKey },
    });
    return typeof response.data === 'string' ? response.data.trim() : String(response.data);
  }

  static decodificarExpiracionToken(token) {
    try {
      const payload = token.split('.')[1];
      const json = Buffer.from(payload, 'base64').toString('utf8');
      const { exp } = JSON.parse(json);
      return exp ? exp * 1000 : Date.now() + 20 * 60 * 1000;
    } catch {
      return Date.now() + 20 * 60 * 1000;
    }
  }

  /**
   * Cachea el token Bearer en memoria del proceso; solo vuelve a autenticar
   * cuando falta menos de 1 minuto para que expire (o no hay token todavía).
   */
  static async autenticar() {
    if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
      return cachedToken;
    }

    const config = this.getConfig();
    const passwordCifrado = await this.encriptar(config.password);

    const response = await axios.post(`${config.baseUrl}/api/authentication/authenticate`, {
      userName: config.user,
      password: passwordCifrado,
    });

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al autenticar con Banco Económico');
    }

    cachedToken = response.data.token;
    tokenExpiresAt = this.decodificarExpiracionToken(cachedToken);
    return cachedToken;
  }

  /**
   * Genera un QR de pago único (singleUse) por el monto exacto (modifyAmount:false).
   * dueDate del banco es solo fecha (yyyy-MM-dd) - no controla la expiración real
   * de 20 minutos, esa la maneja pago.controller.js con `fecha_expiracion`.
   */
  static async generarQR({ transactionId, monto, descripcion }) {
    const config = this.getConfig();
    const token = await this.autenticar();
    const accountCreditCifrado = await this.encriptar(config.accountCredit);

    const hoy = new Date();
    const dueDate = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    let desc = descripcion || `Reserva ${transactionId}`;
    if (desc.length > 200) {
      desc = desc.substring(0, 200);
    }

    const response = await axios.post(
      `${config.baseUrl}/api/qrsimple/generateQR`,
      {
        transactionId: String(transactionId),
        accountCredit: accountCreditCifrado,
        currency: 'BOB',
        amount: parseFloat(monto),
        description: desc,
        dueDate,
        singleUse: true,
        modifyAmount: false,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al generar el QR');
    }

    return {
      qrId: response.data.qrId,
      qrImage: response.data.qrImage,
      fechaExpiracion: new Date(Date.now() + 20 * 60 * 1000),
    };
  }

  /**
   * statusQrCode: 0 = activo pendiente de pago, 1 = pagado, 9 = anulado.
   * El campo `payment` de la respuesta del banco viene como lista; se toma
   * el primer elemento si existe.
   */
  static async consultarEstado(qrId) {
    const config = this.getConfig();
    const token = await this.autenticar();

    const response = await axios.get(`${config.baseUrl}/api/qrsimple/v2/statusQR/${qrId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al consultar el estado del QR');
    }

    const pagos = Array.isArray(response.data.payment)
      ? response.data.payment
      : (response.data.payment ? [response.data.payment] : []);

    return {
      statusQrCode: response.data.statusQrCode,
      pago: pagos[0] || null,
    };
  }

  /**
   * Best-effort: si falla la anulación no debe romper el flujo de expiración
   * (el QR de todas formas ya no se muestra al usuario).
   */
  static async cancelarQR(qrId) {
    try {
      const config = this.getConfig();
      const token = await this.autenticar();
      await axios.delete(`${config.baseUrl}/api/qrsimple/cancelQR`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { qrId },
      });
    } catch (error) {
      console.error('⚠️ No se pudo cancelar el QR (best-effort):', error.message);
    }
  }
}
```

- [ ] **Step 2: Eliminar el script de prueba viejo de Red Enlace**

```bash
git rm backend/test/testRedEnlace.js
```

- [ ] **Step 3: Crear `backend/test/testQrBaneco.js`**

Sigue el mismo patrón manual que usaba `testRedEnlace.js` (no hay framework de tests en el proyecto): un script que se corre con `node` y llama a la API real de certificación.

```js
import { QrBanecoService } from '../services/qrBanecoService.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔧 Test 1: Verificar configuración');
  const config = QrBanecoService.getConfig();
  console.log('✅ Base URL:', config.baseUrl);
  console.log('✅ Usuario:', config.user);
  console.log('✅ AES Key:', config.aesKey ? '***CONFIGURADO***' : '❌ FALTA');
  console.log('✅ Cuenta a acreditar:', config.accountCredit ? '***CONFIGURADO***' : '❌ FALTA');
  console.log('');

  console.log('🔐 Test 2: Autenticación');
  const token = await QrBanecoService.autenticar();
  console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
  console.log('');

  console.log('📱 Test 3: Generar QR de prueba (Bs. 1.00)');
  const qr = await QrBanecoService.generarQR({
    transactionId: `test-${Date.now()}`,
    monto: 1.0,
    descripcion: 'Prueba de integración QR Banco Económico',
  });
  console.log('✅ QR generado. qrId:', qr.qrId);
  console.log('✅ Expira (nuestro control interno):', qr.fechaExpiracion);
  console.log('✅ Imagen QR (primeros 40 caracteres):', qr.qrImage.substring(0, 40) + '...');
  console.log('');

  console.log('🔍 Test 4: Consultar estado del QR recién creado (debería ser 0 = pendiente)');
  const estado = await QrBanecoService.consultarEstado(qr.qrId);
  console.log('✅ statusQrCode:', estado.statusQrCode);
  console.log('');

  console.log('🚫 Test 5: Anular el QR de prueba');
  await QrBanecoService.cancelarQR(qr.qrId);
  console.log('✅ Solicitud de anulación enviada (ver log de arriba si falló)');
  console.log('');

  console.log('🎉 Todos los pasos se ejecutaron. Revisa los valores marcados con ✅ arriba.');
}

main().catch((error) => {
  console.error('❌ Error en el test:', error.message);
  console.log('');
  console.log('🔍 POSIBLES CAUSAS:');
  console.log('   1. Credenciales incorrectas en .env');
  console.log('   2. BANCO_ECONOMICO_BASE_URL mal escrita o sin acceso de red');
  console.log('   3. La cuenta a acreditar no está habilitada en el ambiente de certificación');
});
```

- [ ] **Step 4: Correr el script contra el ambiente de certificación**

Run: `cd backend && node test/testQrBaneco.js`

Expected: los 5 tests imprimen ✅ en orden, terminando con "🎉 Todos los pasos se ejecutaron." Si algo fallara, el mensaje de error indica cuál paso fue (autenticación, generar QR, etc.) — corregir credenciales en `.env` antes de continuar a la Task 3.

- [ ] **Step 5: Commit**

```bash
git add backend/services/qrBanecoService.js backend/test/testQrBaneco.js
git commit -m "feat(pago): agrega QrBanecoService y script de verificación manual"
```

---

### Task 3: Reescribir el controller de pagos

**Files:**
- Modify: `backend/controllers/pago.controller.js`
- Delete: `backend/services/redEnlaceService.js`

**Interfaces:**
- Consumes: `QrBanecoService.generarQR/consultarEstado/cancelarQR` (de Task 2).
- Produces: `iniciarPago` responde `{ success, qrImage, qrId, fecha_expiracion, id_pago, id_reserva, monto }`; `iniciarPagoMultiple` responde `{ success, qrImage, qrId, fecha_expiracion, id_pago, ids_reserva, monto_total }`; `verificarEstadoPago` responde la fila de `pago` (incluye `estado_pago`, `estado_reserva`). Las tareas 5-7 (frontend) consumen exactamente estos nombres de campo.

- [ ] **Step 1: Reemplazar el contenido completo de `backend/controllers/pago.controller.js`**

```js
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
```

- [ ] **Step 2: Eliminar el servicio de Red Enlace**

```bash
git rm backend/services/redEnlaceService.js
```

- [ ] **Step 3: Verificar que no queden referencias a Red Enlace en el backend**

Run: `cd backend && grep -rln "redEnlaceService\|RedEnlaceService\|RED_ENLACE" --include="*.js" . | grep -v node_modules`

Expected: sin resultados (ya no debe aparecer ningún archivo).

- [ ] **Step 4: Commit**

```bash
git add backend/controllers/pago.controller.js
git commit -m "feat(pago): reescribe controller para usar QR de Banco Economico"
```

---

### Task 4: Actualizar rutas de pago

**Files:**
- Modify: `backend/routes/pago.routes.js`

**Interfaces:**
- Consumes: `iniciarPago`, `iniciarPagoMultiple`, `verificarEstadoPago` de `pago.controller.js` (Task 3).

- [ ] **Step 1: Reemplazar el contenido completo de `backend/routes/pago.routes.js`**

```js
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
```

- [ ] **Step 2: Levantar el backend y verificar que arranca sin errores**

Run: `cd backend && npm run dev`
Expected: el servidor arranca sin errores de importación (ya no debe intentar importar `webhookRedEnlace` ni `redEnlaceService.js`). Detener con Ctrl+C después de confirmar.

- [ ] **Step 3: Commit**

```bash
git add backend/routes/pago.routes.js
git commit -m "feat(pago): elimina ruta de webhook de Red Enlace"
```

---

### Task 5: Limpiar el servicio de pago del frontend

**Files:**
- Modify: `frontend/src/services/pago.js`

**Interfaces:**
- Produces: `iniciarPago(id_reserva)`, `iniciarPagoMultiple(ids_reserva)`, `verificarEstadoPago(id_reserva)` — mismas firmas que ya consumen `ModalReserva.jsx`, `ModalCarrito.jsx`, `Misreservas.jsx`.

- [ ] **Step 1: Quitar el parámetro `metodo_pago` obsoleto (era específico de Red Enlace)**

En `frontend/src/services/pago.js`, reemplazar:

```js
export const iniciarPago = async (id_reserva) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/api/pagos/iniciar`,
    { 
      id_reserva,
      metodo_pago: 'tarjeta' // Red Enlace mostrará todas las opciones
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};
```

por:

```js
export const iniciarPago = async (id_reserva) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_URL}/api/pagos/iniciar`,
    { id_reserva },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};
```

`iniciarPagoMultiple` y `verificarEstadoPago` quedan igual — no dependen de esa lógica.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/pago.js
git commit -m "chore(pago): limpia parametro obsoleto de Red Enlace en servicio frontend"
```

---

### Task 6: Componente `ModalPagoQR`

**Files:**
- Create: `frontend/src/pages/Home/ModalPagoQR.jsx`

**Interfaces:**
- Consumes: `verificarEstadoPago(idReserva)` de `frontend/src/services/pago.js` (Task 5) — responde `{ estado_pago, estado_reserva, ... }`.
- Produces: componente `ModalPagoQR` con props `{ idReserva, qrImage, fechaExpiracion, monto, onRegenerar, onSuccess, onClose }`, donde `onRegenerar` es una función `async () => resultadoPago` que debe devolver `{ success, qrImage, fecha_expiracion }` (la misma forma que devuelven `iniciarPago`/`iniciarPagoMultiple`). Las Tasks 7-9 son quienes pasan `onRegenerar`.

- [ ] **Step 1: Crear `frontend/src/pages/Home/ModalPagoQR.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react';
import { verificarEstadoPago } from '../../services/pago';

const ModalPagoQR = ({ idReserva, qrImage, fechaExpiracion, monto, onRegenerar, onSuccess, onClose }) => {
  const [imagen, setImagen] = useState(qrImage);
  const [expiracion, setExpiracion] = useState(fechaExpiracion);
  const [estado, setEstado] = useState('pendiente'); // pendiente | aprobado | expirado
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [regenerando, setRegenerando] = useState(false);
  const [error, setError] = useState('');

  const calcularSegundosRestantes = useCallback(() => {
    const restante = Math.floor((new Date(expiracion).getTime() - Date.now()) / 1000);
    return restante > 0 ? restante : 0;
  }, [expiracion]);

  // Cuenta regresiva visual, 1 vez por segundo
  useEffect(() => {
    setSegundosRestantes(calcularSegundosRestantes());
    const intervaloCuenta = setInterval(() => {
      const restante = calcularSegundosRestantes();
      setSegundosRestantes(restante);
      if (restante <= 0) {
        setEstado((prev) => (prev === 'pendiente' ? 'expirado' : prev));
      }
    }, 1000);
    return () => clearInterval(intervaloCuenta);
  }, [calcularSegundosRestantes]);

  // Polling del estado real del pago cada 5 segundos, mientras esté pendiente
  useEffect(() => {
    if (estado !== 'pendiente') return undefined;

    const intervaloPolling = setInterval(async () => {
      try {
        const pago = await verificarEstadoPago(idReserva);
        if (pago.estado_pago === 'aprobado') {
          setEstado('aprobado');
          clearInterval(intervaloPolling);
          onSuccess();
        } else if (pago.estado_pago === 'expirado') {
          setEstado('expirado');
          clearInterval(intervaloPolling);
        }
      } catch (err) {
        console.error('Error verificando estado de pago:', err);
      }
    }, 5000);

    return () => clearInterval(intervaloPolling);
  }, [estado, idReserva, onSuccess]);

  const handleRegenerar = async () => {
    setRegenerando(true);
    setError('');
    try {
      const resultado = await onRegenerar();
      if (resultado.success && resultado.qrImage) {
        setImagen(resultado.qrImage);
        setExpiracion(resultado.fecha_expiracion);
        setEstado('pendiente');
      } else {
        setError('No se pudo generar un nuevo QR. Intenta de nuevo.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar un nuevo QR');
    } finally {
      setRegenerando(false);
    }
  };

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 flex justify-between items-start">
          <div>
            <div className="text-4xl mb-2">📱</div>
            <h2 className="text-2xl font-bold">Pago con QR</h2>
            <p className="text-green-100 text-sm">Banco Económico</p>
          </div>
          {estado !== 'aprobado' && (
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 text-center">
          {estado === 'aprobado' && (
            <div className="py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">¡Pago confirmado!</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tu reserva quedó confirmada.</p>
            </div>
          )}

          {estado === 'expirado' && (
            <div className="py-6">
              <div className="text-5xl mb-4">⏰</div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">El QR expiró</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Genera uno nuevo para completar el pago.</p>
              {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
              <button
                onClick={handleRegenerar}
                disabled={regenerando}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold disabled:opacity-60"
              >
                {regenerando ? 'Generando...' : 'Generar nuevo QR'}
              </button>
            </div>
          )}

          {estado === 'pendiente' && (
            <>
              <img
                src={`data:image/png;base64,${imagen}`}
                alt="Código QR de pago"
                className="mx-auto w-64 h-64 object-contain rounded-2xl border border-gray-200 dark:border-gray-700"
              />
              <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Bs. {monto}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Escanea el código con la app de tu banco
              </p>
              <p className="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-400">
                Vence en {minutos}:{String(segundos).padStart(2, '0')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPagoQR;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Home/ModalPagoQR.jsx
git commit -m "feat(pago): agrega ModalPagoQR con countdown y polling"
```

---

### Task 7: Integrar `ModalPagoQR` en `ModalReserva.jsx`

**Files:**
- Modify: `frontend/src/pages/Home/ModalReserva.jsx`

**Interfaces:**
- Consumes: `ModalPagoQR` (Task 6), `iniciarPago` (ya importado, sin cambios de firma).

- [ ] **Step 1: Agregar el import y el estado del QR**

Reemplazar la línea de import (línea 8 actual):

```js
import CalendarioReserva from './CalendarioReserva';
```

por:

```js
import CalendarioReserva from './CalendarioReserva';
import ModalPagoQR from './ModalPagoQR';
```

Y dentro del componente, junto a los demás `useState` (después de la línea `const [error, setError] = useState('');`), agregar:

```js
const [pagoQR, setPagoQR] = useState(null);
```

- [ ] **Step 2: Reemplazar el bloque de "iniciar pago y redirigir"**

Reemplazar (dentro de `handleSubmit`, el bloque que va desde `// 2️⃣ INICIAR EL PAGO INMEDIATAMENTE` hasta el `}` que cierra el `else` del "Reserva creada pero no se pudo iniciar el pago"):

```js
      // 2️⃣ INICIAR EL PAGO INMEDIATAMENTE
      console.log('💳 Paso 2: Iniciando proceso de pago...');
      const resultadoPago = await iniciarPago(idReserva);

      if (resultadoPago.success && resultadoPago.paymentUrl) {
        console.log('🔗 Link de pago generado:', resultadoPago.paymentUrl);
        
        // Guardar info para cuando regrese
        sessionStorage.setItem('pago_pendiente', JSON.stringify({
          id_reserva: idReserva,
          id_pago: resultadoPago.id_pago,
          timestamp: new Date().getTime()
        }));

        // 3️⃣ REDIRIGIR A RED ENLACE
        console.log('🚀 Paso 3: Redirigiendo a Red Enlace...');
        
        // Cerrar modal y notificar éxito
        onSuccess();
        onClose();
        
        // Pequeña pausa para que el usuario vea que se procesó
        setTimeout(() => {
          alert('¡Reserva creada! Serás redirigido al portal de pagos.');
          window.location.href = resultadoPago.paymentUrl;
        }, 500);
        
      } else {
        setError('Reserva creada pero no se pudo iniciar el pago. Ve a "Mis Reservas" para completar el pago.');
        console.error('Error al generar link de pago:', resultadoPago);
      }
```

por:

```js
      // 2️⃣ GENERAR EL QR DE PAGO
      console.log('💳 Paso 2: Generando QR de pago...');
      const resultadoPago = await iniciarPago(idReserva);

      if (resultadoPago.success && resultadoPago.qrImage) {
        setPagoQR({
          idReserva,
          qrImage: resultadoPago.qrImage,
          fechaExpiracion: resultadoPago.fecha_expiracion,
          monto: resultadoPago.monto,
        });
      } else {
        setError('Reserva creada pero no se pudo generar el QR de pago. Ve a "Mis Reservas" para completar el pago.');
        console.error('Error al generar QR de pago:', resultadoPago);
      }
```

- [ ] **Step 3: Renderizar `ModalPagoQR` en vez del formulario cuando ya hay un QR activo**

Ubicar el `return (` del componente (línea con `<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50...`) e insertar, justo antes de ese `return`:

```js
  if (pagoQR) {
    return (
      <ModalPagoQR
        idReserva={pagoQR.idReserva}
        qrImage={pagoQR.qrImage}
        fechaExpiracion={pagoQR.fechaExpiracion}
        monto={pagoQR.monto}
        onRegenerar={() => iniciarPago(pagoQR.idReserva)}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

```

- [ ] **Step 4: Verificación manual en el navegador**

Run: `cd frontend && npm run dev` (si no está ya corriendo)

En el navegador: iniciar sesión como cliente, abrir una habitación, completar fechas y enviar el formulario de reserva.

Expected: en vez de un `alert` + redirección, se muestra el modal con la imagen del QR, el monto y la cuenta regresiva "Vence en 19:59" bajando cada segundo.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home/ModalReserva.jsx
git commit -m "feat(pago): ModalReserva muestra QR de pago en vez de redirigir"
```

---

### Task 8: Integrar `ModalPagoQR` en `ModalCarrito.jsx`

**Files:**
- Modify: `frontend/src/pages/Home/ModalCarrito.jsx`

**Interfaces:**
- Consumes: `ModalPagoQR` (Task 6), `iniciarPagoMultiple` (ya importado, sin cambios de firma).

- [ ] **Step 1: Agregar el import y el estado del QR**

Reemplazar la línea de import (línea 9 actual):

```js
import CalendarioReserva from './CalendarioReserva';
```

por:

```js
import CalendarioReserva from './CalendarioReserva';
import ModalPagoQR from './ModalPagoQR';
```

Y junto a los demás `useState` (después de `const [mostrarDetalles, setMostrarDetalles] = useState(false);`), agregar:

```js
const [pagoQR, setPagoQR] = useState(null);
```

- [ ] **Step 2: Reemplazar el bloque de "iniciar pago y redirigir"**

Reemplazar (dentro de `handleSubmit`):

```js
      // 2️⃣ UN solo pago para TODAS las reservas con el total combinado
      const resultadoPago = await iniciarPagoMultiple(reservasIds);

      if (resultadoPago.success && resultadoPago.paymentUrl) {
        sessionStorage.setItem('pago_pendiente', JSON.stringify({
          ids_reserva: reservasIds,
          id_pago: resultadoPago.id_pago,
          monto_total: resultadoPago.monto_total,
          timestamp: Date.now(),
        }));

        limpiarCarrito();
        onClose();

        setTimeout(() => {
          alert(`¡${reservasIds.length} ${reservasIds.length === 1 ? 'reserva creada' : 'reservas creadas'}! Serás redirigido al portal de pagos para completar el pago total.`);
          window.location.href = resultadoPago.paymentUrl;
        }, 400);
      } else {
        setError('Reservas creadas pero no se pudo iniciar el pago. Ve a "Mis Reservas" para completar el pago.');
      }
```

por:

```js
      // 2️⃣ UN solo QR para TODAS las reservas con el total combinado
      const resultadoPago = await iniciarPagoMultiple(reservasIds);

      if (resultadoPago.success && resultadoPago.qrImage) {
        setPagoQR({
          idReserva: reservasIds[0],
          idsReserva: reservasIds,
          qrImage: resultadoPago.qrImage,
          fechaExpiracion: resultadoPago.fecha_expiracion,
          monto: resultadoPago.monto_total,
        });
      } else {
        setError('Reservas creadas pero no se pudo generar el QR de pago. Ve a "Mis Reservas" para completar el pago.');
      }
```

- [ ] **Step 3: Renderizar `ModalPagoQR` en vez del formulario cuando ya hay un QR activo**

Ubicar el `return (` del componente (línea con `<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50...`) e insertar, justo antes de ese `return`:

```js
  if (pagoQR) {
    return (
      <ModalPagoQR
        idReserva={pagoQR.idReserva}
        qrImage={pagoQR.qrImage}
        fechaExpiracion={pagoQR.fechaExpiracion}
        monto={pagoQR.monto}
        onRegenerar={() => iniciarPagoMultiple(pagoQR.idsReserva)}
        onSuccess={() => {
          limpiarCarrito();
          onClose();
        }}
        onClose={onClose}
      />
    );
  }

```

- [ ] **Step 4: Verificación manual en el navegador**

En el navegador: agregar 2 habitaciones al carrito, abrir el carrito, completar fechas y confirmar.

Expected: se muestra el modal de QR con el monto total combinado de ambas habitaciones.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home/ModalCarrito.jsx
git commit -m "feat(pago): ModalCarrito muestra QR de pago en vez de redirigir"
```

---

### Task 9: Integrar `ModalPagoQR` en `Misreservas.jsx`

**Files:**
- Modify: `frontend/src/pages/Home/Misreservas.jsx`

**Interfaces:**
- Consumes: `ModalPagoQR` (Task 6), `iniciarPago` (ya importado, sin cambios de firma).

- [ ] **Step 1: Agregar el import y el estado del QR**

Reemplazar la línea de import (línea 5 actual):

```js
import { iniciarPago } from '../../services/pago.js';
```

por:

```js
import { iniciarPago } from '../../services/pago.js';
import ModalPagoQR from './ModalPagoQR';
```

Y junto a los demás `useState` (después de `const [procesandoPago, setProcesandoPago] = useState(null);`), agregar:

```js
const [pagoQR, setPagoQR] = useState(null);
```

- [ ] **Step 2: Reemplazar `handleContinuarPago`**

Reemplazar:

```js
  const handleContinuarPago = async (id_reserva) => {
    setProcesandoPago(id_reserva);
    try {
      const resultado = await iniciarPago(id_reserva);
      if (resultado.success && resultado.paymentUrl) {
        sessionStorage.setItem('pago_pendiente', JSON.stringify({
          id_reserva,
          id_pago: resultado.id_pago,
          timestamp: Date.now(),
        }));
        window.location.href = resultado.paymentUrl;
      } else {
        alert('No se pudo generar el enlace de pago. Intenta de nuevo.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al iniciar el pago');
    } finally {
      setProcesandoPago(null);
    }
  };
```

por:

```js
  const handleContinuarPago = async (id_reserva) => {
    setProcesandoPago(id_reserva);
    try {
      const resultado = await iniciarPago(id_reserva);
      if (resultado.success && resultado.qrImage) {
        setPagoQR({
          idReserva: id_reserva,
          qrImage: resultado.qrImage,
          fechaExpiracion: resultado.fecha_expiracion,
          monto: resultado.monto,
        });
      } else {
        alert('No se pudo generar el QR de pago. Intenta de nuevo.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al iniciar el pago');
    } finally {
      setProcesandoPago(null);
    }
  };
```

- [ ] **Step 3: Renderizar `ModalPagoQR` al final del árbol JSX**

Ubicar el cierre del componente — el `</div>` final antes de `);` que cierra el `return` principal (justo antes de la línea `);` seguida de `};` y `export default MisReservas;`) — e insertar el modal justo antes de ese `</div>` de cierre final, así:

Buscar:

```jsx
          </>
        )}
      </div>
    </div>
  );
};

export default MisReservas;
```

Reemplazar por:

```jsx
          </>
        )}
      </div>

      {pagoQR && (
        <ModalPagoQR
          idReserva={pagoQR.idReserva}
          qrImage={pagoQR.qrImage}
          fechaExpiracion={pagoQR.fechaExpiracion}
          monto={pagoQR.monto}
          onRegenerar={() => iniciarPago(pagoQR.idReserva)}
          onSuccess={() => {
            setPagoQR(null);
            cargarReservas();
          }}
          onClose={() => setPagoQR(null)}
        />
      )}
    </div>
  );
};

export default MisReservas;
```

- [ ] **Step 4: Verificación manual en el navegador**

En "Mis Reservas", buscar una reserva con estado "pendiente" y hacer click en "Continuar Pago".

Expected: se abre el modal de QR sobre la lista de reservas; al cerrarlo con la X, vuelve a la lista normalmente.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home/Misreservas.jsx
git commit -m "feat(pago): Misreservas muestra QR de pago en vez de redirigir"
```

---

## Verificación final end-to-end

Después de completar las 9 tareas:

1. Confirmar que el backend arranca sin errores: `cd backend && npm run dev`
2. Confirmar que el frontend arranca sin errores: `cd frontend && npm run dev`
3. Hacer una reserva real de prueba y verificar que el QR se muestra, y que al pagarlo desde la app de un banco real (ambiente de certificación) el modal detecta el pago en menos de 5-10 segundos y muestra "¡Pago confirmado!"
4. Verificar en la base de datos que la fila de `pago` quedó con `estado_pago = 'aprobado'` y la `reserva.estado = 'confirmada'`
5. Probar el caso de expiración: generar un QR y esperar (o, temporalmente, cambiar `20 * 60 * 1000` por un valor más corto como `10000` en `qrBanecoService.js` solo para esta prueba, revirtiéndolo después) para confirmar que aparece "El QR expiró" y el botón "Generar nuevo QR" funciona.
