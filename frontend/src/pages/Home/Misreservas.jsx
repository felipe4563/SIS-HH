import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { obtenerMisReservas, cancelarReserva } from '../../services/reserva.js';
import { iniciarPago } from '../../services/pago.js';
import ModalPagoQR from './ModalPagoQR';

const MisReservas = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(null);
  const [pagoQR, setPagoQR] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'cliente') {
      navigate('/');
      return;
    }
    cargarReservas();
  }, [usuario, navigate]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerMisReservas();
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }
    try {
      await cancelarReserva(id);
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-none',
      confirmada: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-emerald-100 dark:shadow-none',
      cancelada: 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-rose-100 dark:shadow-none',
      finalizada: 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-slate-100 dark:shadow-none'
    };
    const iconos = {
      pendiente: '⏳',
      confirmada: '✅',
      cancelada: '❌',
      finalizada: '🏁'
    };
    return (
      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-sm backdrop-blur-sm ${badges[estado]} uppercase tracking-wider`}>
        <span className="mr-2 text-base">{iconos[estado]}</span>
        {estado}
      </div>
    );
  };

  const formatearFechaStr = (fecha) => {
    const date = new Date(fecha);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return date.toLocaleDateString('es-ES', options).replace(',', '');
  };

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/800x600/1e3a8a/ffffff?text=Hostal+Suri';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    
    // Solución para redes LAN (dispositivos móviles)
    let baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
    if (baseUrl.includes('localhost') && window.location.hostname !== 'localhost') {
      baseUrl = baseUrl.replace('localhost', window.location.hostname);
    }
    
    if (ruta.startsWith('habitaciones/')) return `${baseUrl}/api/uploads/${ruta}`;
    return `${baseUrl}/api/uploads/habitaciones/${ruta}`;
  };

  if (!usuario || usuario.tipo !== 'cliente') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 pb-20 transition-colors">
      {/* Header Premium */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-[#0F172A] dark:via-[#1E3A8A] dark:to-[#2563EB] overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-0 dark:opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          <Link to="/" className="inline-flex items-center text-blue-700 dark:text-blue-200 hover:text-blue-900 dark:hover:text-white transition-colors mb-6 group">
            <span className="bg-black/5 dark:bg-white/10 p-2 rounded-full mr-3 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            <span className="font-medium tracking-wide">Volver al inicio</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Mis Reservas</h1>
              <p className="text-slate-600 dark:text-blue-100 text-base sm:text-lg max-w-2xl font-light">
                Administra tus estadías y revisa el estado de tus reservas en <span className="font-semibold text-slate-900 dark:text-white">Hostal Suri</span>.
              </p>
            </div>

            {/* Perfil Mini */}
            <div className="flex items-center gap-4 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xl dark:shadow-2xl w-full md:w-auto">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight truncate">{usuario.nombre} {usuario.apellido}</h3>
                <p className="text-slate-500 dark:text-blue-200 text-sm truncate">{usuario.correo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divisor */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[40px] sm:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,195.96,114.07,238.94,108.06,281.39,81.42,321.39,56.44Z" className="fill-[#F8FAFC] dark:fill-gray-950"></path>
          </svg>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Buscando tus reservas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center shadow-sm max-w-2xl mx-auto mt-10">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-700 dark:text-red-400 font-bold text-lg mb-6">{error}</p>
            <button onClick={cargarReservas} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Intentar de nuevo
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {reservas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                {reservas.map((reserva) => {
                  const esActiva = reserva.estado === 'confirmada' || reserva.estado === 'pendiente';

                  return (
                    <div key={reserva.id_reserva} className={`group flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden transition-all duration-300 border ${esActiva ? 'border-blue-100 dark:border-blue-900/60 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1' : 'border-slate-200 dark:border-gray-800 shadow-md opacity-90'}`}>

                      {/* 🖼️ Imagen */}
                      <div className="relative h-48 sm:h-56 bg-slate-100 dark:bg-gray-800 overflow-hidden">
                        <img
                          src={construirUrlImagen(reserva.imagen_portada)}
                          alt={`Habitación ${reserva.numero_habitacion}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.target.src = 'https://placehold.co/800x600/1e3a8a/ffffff?text=Hostal+Suri'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-black/10 to-transparent"></div>

                        <div className="absolute top-4 left-4 z-10">
                          {getEstadoBadge(reserva.estado)}
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
                          <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/30 mb-1.5">
                            {reserva.tipo_habitacion}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold drop-shadow-md truncate">Hab. {reserva.numero_habitacion}</h3>
                          <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
                            👥 Capacidad: {reserva.capacidad_habitacion} pax
                          </p>
                        </div>
                      </div>

                      {/* 📄 Contenido y Detalles */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="flex justify-between items-start gap-3 mb-4 border-b border-slate-100 dark:border-gray-800 pb-4">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Reserva #{reserva.id_reserva}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Realizada el {new Date(reserva.fecha_creacion || Date.now()).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-gray-100">Bs. {parseFloat(reserva.total).toFixed(2)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{reserva.noches} noche{reserva.noches !== 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3 border border-slate-100 dark:border-gray-700">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-0.5">Check-in</p>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{formatearFechaStr(reserva.fecha_entrada)}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">14:00 hrs</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3 border border-slate-100 dark:border-gray-700">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-0.5">Check-out</p>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{formatearFechaStr(reserva.fecha_salida)}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">11:00 hrs</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3 border border-slate-100 dark:border-gray-700">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-0.5">Huéspedes</p>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{reserva.cantidad_adultos} Ad, {reserva.cantidad_ninos} Ni</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3 border border-slate-100 dark:border-gray-700">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-0.5">Llegada Est.</p>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{reserva.hora_llegada ? reserva.hora_llegada.substring(0,5) : 'No def.'}</p>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto pt-5 border-t border-slate-100 dark:border-gray-800 flex flex-col gap-3">

                          {reserva.estado === 'pendiente' && (
                            <p className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 rounded-xl font-medium text-sm">
                              <span>💳</span> Pago pendiente
                            </p>
                          )}
                          {reserva.estado === 'confirmada' && (
                            <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-xl font-medium text-sm">
                              <span>🎉</span> Todo listo para tu llegada
                            </p>
                          )}
                          {reserva.estado === 'cancelada' && (
                            <p className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 rounded-xl font-medium text-sm">
                              <span>🚫</span> Esta reserva fue cancelada
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
                            {reserva.estado === 'pendiente' && (
                              <button
                                onClick={() => handleContinuarPago(reserva.id_reserva)}
                                disabled={procesandoPago === reserva.id_reserva}
                                className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                              >
                                {procesandoPago === reserva.id_reserva ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generando...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Continuar Pago
                                  </>
                                )}
                              </button>
                            )}
                            {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                              <button
                                onClick={() => handleCancelarReserva(reserva.id_reserva)}
                                className="flex-1 px-5 py-3 rounded-xl font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm"
                              >
                                Cancelar Reserva
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl text-center max-w-lg border border-slate-100 dark:border-gray-800">
                  <div className="text-8xl mb-6 select-none">🧳</div>
                  <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-gray-100 mb-4">Aún no tienes reservas</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Tu próxima gran aventura o viaje de negocios comienza aquí. ¡Descubre nuestras habitaciones!</p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 text-lg"
                  >
                    <span>Explorar Habitaciones</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </div>
            )}
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