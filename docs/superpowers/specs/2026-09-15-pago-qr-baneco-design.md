# Integración de pagos con QR (Banco Económico) — Diseño

## Contexto

El sistema usa hoy la pasarela **Red Enlace/EnlazateOnline** para procesar pagos
de reservas: redirige al cliente a una página externa, y confirma vía webhook.

Se reemplaza por completo por **QR Connect v1.4.0** de Banco Económico (API
Market), producto "Pago Simple QR": el backend genera un QR con monto fijo,
el cliente lo escanea con la app de su banco (cualquier banco, es
interoperable) y paga sin salir del sitio. Red Enlace se elimina del código.

El proyecto aún no está en producción, así que no hay datos ni esquema de BD
que migrar con cuidado — se puede definir el esquema final directamente.

## Decisiones acordadas

- Reemplaza a Red Enlace por completo (se elimina su servicio, rutas, webhook
  y textos de UI).
- Disponible tanto para pago de una reserva individual como para el carrito
  (múltiples reservas combinadas en un solo QR), replicando el patrón actual
  de `iniciarPago` / `iniciarPagoMultiple`.
- Confirmación de pago por **polling**, no por webhook. El frontend solo
  llama a nuestro propio endpoint `/api/pagos/estado/:id_reserva`, que a su
  vez consulta al banco cuando corresponde.
- Credenciales del banco (usuario, password, clave AES, cuenta a acreditar)
  las carga el usuario directamente en `backend/.env`; el código solo debe
  dejar las variables declaradas en `.env.example`.

## Base de datos

Editar `bd/bd_hostal_nuevo.sql` (dump base, aún no usado en producción) para
que la tabla `pago` quede:

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

No incluye `'red_enlace'` en el enum de `metodo_pago`: ese método se elimina
del sistema. `fecha_expiracion` guarda el vencimiento del QR generado, para
que el backend sepa cuándo darlo por caducado y el frontend pueda mostrar
una cuenta regresiva.

El usuario aplicará este cambio manualmente a su base de datos local/de
despliegue (re-importar el dump o correr un `ALTER TABLE` equivalente).

## Backend

### `backend/services/qrBanecoService.js` (nuevo, reemplaza a `redEnlaceService.js`)

Clase estática, mismo rol que `RedEnlaceService` pero para Banco Económico:

- `getConfig()`: lee `BANCO_ECONOMICO_BASE_URL/USER/PASSWORD/AES_KEY/ACCOUNT_CREDIT` de `process.env`.
- `autenticar()`: `POST {base}/api/authentication/authenticate`. Cachea el
  token Bearer en una variable de módulo junto a su expiración; solo vuelve
  a autenticar cuando falta poco o ya venció.
- `encriptarCuenta()`: usa el endpoint de cifrado del propio banco para
  cifrar `BANCO_ECONOMICO_ACCOUNT_CREDIT` (no se reimplementa el algoritmo
  AES localmente — el banco expone el servicio para esto).
- `generarQR({ transactionId, monto, descripcion })`: `POST
  {base}/api/qrsimple/generateQR` con `singleUse: true`,
  `modifyAmount: false`, vencimiento de 20 minutos. Devuelve
  `{ qrId, qrImage, fechaExpiracion }`.
- `consultarEstado(qrId)`: `GET {base}/api/qrsimple/v2/statusQR/{id}`.
- `cancelarQR(qrId)`: `DELETE {base}/api/qrsimple/cancelQR`. Uso
  "best effort": si falla no rompe el flujo de expiración.

### `backend/controllers/pago.controller.js`

Se reescribe manteniendo la forma de las funciones existentes:

- `iniciarPago(id_reserva)`: valida la reserva (igual que hoy), llama a
  `qrBanecoService.generarQR`, inserta en `pago`
  (`metodo_pago='qr'`, `estado_pago='pendiente'`, `transaccion_id=qrId`,
  `fecha_expiracion`), responde `{ success, qrImage, qrId, fecha_expiracion, id_pago, id_reserva, monto }`.
- `iniciarPagoMultiple(ids_reserva)`: mismo patrón que hoy (un solo QR por el
  total combinado, `datos_transaccion` guarda `ids_reserva_todas` para que
  la confirmación actualice todas las reservas vinculadas).
- `verificarEstadoPago(id_reserva)`: lee el pago más reciente de la reserva.
  Si `estado_pago === 'pendiente'`:
  - si ya pasó `fecha_expiracion`: marca `estado_pago='expirado'`, intenta
    `cancelarQR` (best-effort), dejando la(s) reserva(s) en `pendiente` para
    reintentar.
  - si no expiró: consulta `consultarEstado(transaccion_id)` al banco; si el
    banco confirma el pago, marca `pago.estado_pago='aprobado'` y actualiza
    `reserva.estado='confirmada'` para todas las reservas vinculadas (mismo
    mecanismo de `ids_reserva_todas` que ya existe).
  Responde el registro de `pago` actualizado.
- Se elimina `webhookRedEnlace`.

### `backend/routes/pago.routes.js`

Se mantienen las mismas rutas (`POST /iniciar`, `POST /iniciar-multiple`,
`GET /estado/:id_reserva`); se elimina `POST /webhook-red-enlace`.

### `backend/.env.example`

Se quitan las variables `RED_ENLACE_*` y se agregan:

```
BANCO_ECONOMICO_BASE_URL=
BANCO_ECONOMICO_USER=
BANCO_ECONOMICO_PASSWORD=
BANCO_ECONOMICO_AES_KEY=
BANCO_ECONOMICO_ACCOUNT_CREDIT=
```

## Frontend

### `frontend/src/services/pago.js`

Mismas tres funciones exportadas (`iniciarPago`, `iniciarPagoMultiple`,
`verificarEstadoPago`), sin cambios de firma — solo cambia la forma de la
respuesta que ya trae el backend (ya no hay `paymentUrl`; ahora hay
`qrImage`/`qrId`/`fecha_expiracion`).

### `frontend/src/pages/Home/ModalPagoQR.jsx` (nuevo)

Modal que reemplaza la redirección externa:

- Muestra la imagen del QR (`data:image/png;base64,...`).
- Cuenta regresiva hasta `fecha_expiracion`.
- Hace polling a `verificarEstadoPago(id_reserva)` cada 5 segundos mientras
  está abierto.
- Si `estado_pago` pasa a `'aprobado'`: cierra el modal y llama `onSuccess`.
- Si expira (`estado_pago === 'expirado'` o countdown llega a 0): muestra
  botón "Generar nuevo QR" que vuelve a llamar `iniciarPago`/`iniciarPagoMultiple`
  y refresca la imagen/expiración.

### Puntos de integración existentes

`ModalReserva.jsx`, `ModalCarrito.jsx` y `Misreservas.jsx` hoy hacen
`window.location.href = resultado.paymentUrl` tras `iniciarPago`/
`iniciarPagoMultiple`. Se reemplaza por abrir `ModalPagoQR` con los datos
devueltos (`qrImage`, `id_reserva` o `ids_reserva`, `fecha_expiracion`).
Los textos de "pasarela externa Red Enlace" se actualizan a "Pago con QR —
Banco Económico".

### Limpieza

Se elimina `frontend/src/pages/Home/ModalPreparacionPago.jsx`: no está
importado por ningún otro archivo (código muerto que además hardcodea
copy de Red Enlace).

## Fuera de alcance

- Webhook `notifyPaymentQR` del banco (se decidió polling puro).
- Endpoints de consulta de cuentas, pagos por lote, `dataQR`/`payQR` (son
  para cuando el comercio *paga* por QR, no para cuando *cobra*, no aplican).
- Reconciliación vía `paidQR/{fecha}` (no pedida; se podría agregar después
  como tarea de auditoría, no bloquea esta integración).
