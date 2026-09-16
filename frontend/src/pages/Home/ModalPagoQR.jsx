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
