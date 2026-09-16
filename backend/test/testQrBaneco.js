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
