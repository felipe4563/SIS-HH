import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getHabitaciones } from '../services/habitacion';
import HabitacionCard from '../pages/Home/HabitacionCard';
import FiltrosHabitaciones from '../pages/Home/FiltrosHabitaciones';
import ModalReserva from '../pages/Home/ModalReserva';

/* ── Iconos SVG ─────────────────────────────────────────────────────────── */
const ICON_DEFS = {
  building:      ['M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21'],
  userCircle:    ['M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  clipboardList: ['M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'],
  identification:['M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z'],
  logout:        ['M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9'],
  sparkles:      ['M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'],
  wifi:          ['M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z'],
  bell:          ['M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'],
  shine:         ['M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z'],
  mapPin:        ['M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'],
  checkCircle:   ['M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  globe:         ['M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'],
  creditCard:    ['M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z'],
  exclamation:   ['M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'],
  search:        ['m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'],
  shield:        ['M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z'],
  star:          ['M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'],
  phone:         ['M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z'],
  arrowDown:     ['M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3'],
  home:          ['m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'],
};

const SvgIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    {(ICON_DEFS[name] || []).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);

/* ── Hook: Contador animado ─────────────────────────────────────────────── */
function useAnimatedCounter(end, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;
    if (end === 0) { setCount(0); return; }

    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

/* ── Skeleton Card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-brand-mist/40 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-md">
      <div className="h-56 sm:h-64 bg-slate-200 dark:bg-gray-800 animate-shimmer" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-gray-700 animate-shimmer" />
            <div className="h-4 w-24 rounded-lg bg-slate-200 dark:bg-gray-700 animate-shimmer" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-gray-700 animate-shimmer" />
            <div className="h-3 w-14 rounded-lg bg-slate-200 dark:bg-gray-700 animate-shimmer ml-auto" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-28 rounded-full bg-slate-200 dark:bg-gray-700 animate-shimmer" />
          <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-gray-700 animate-shimmer" />
        </div>
        <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-gray-700 animate-shimmer" />
        <div className="h-11 w-full rounded-xl bg-slate-200 dark:bg-gray-700 animate-shimmer" />
      </div>
    </div>
  );
}

/* ── WhatsApp Icon (SVG) ────────────────────────────────────────────────── */
const WhatsAppIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* ────────────────────────────────────────────────────────────────────────── */

// Número de WhatsApp — CAMBIA ESTE NÚMERO POR EL REAL
const WHATSAPP_NUMERO = '59177123456';
const WHATSAPP_MENSAJE = '¡Hola! Me interesa información sobre las habitaciones de H&H Residencial.';

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const habitacionesRef = useRef(null);

  const scrollAlMapa = () => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollAHabitaciones = () => habitacionesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({});
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const esCliente = usuario?.tipo === 'cliente';
  const esUsuarioSistema = usuario && !esCliente;

  useEffect(() => { cargarHabitaciones(); }, []);

  const cargarHabitaciones = async (filtrosAplicados = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getHabitaciones(filtrosAplicados);
      setHabitaciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    cargarHabitaciones(nuevosFiltros);
  };

  const handleReservar = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setMostrarModalReserva(true);
  };

  const handleReservaExitosa = () => {
    alert('¡Reserva creada exitosamente!');
    cargarHabitaciones(filtros);
  };

  const handleCerrarSesion = () => {
    logout();
    navigate('/');
    setMenuUsuarioAbierto(false);
    setMenuMovilAbierto(false);
  };

  const cerrarMenus = () => { setMenuMovilAbierto(false); setMenuUsuarioAbierto(false); };

  const totalHabitaciones       = habitaciones.length;
  const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'disponible').length;
  const habitacionesConTour360  = habitaciones.filter(h => h.imagenes?.some(i => i.tipo_imagen === '360')).length;

  /* Contadores animados */
  const animTotal       = useAnimatedCounter(totalHabitaciones);
  const animDisponibles = useAnimatedCounter(habitacionesDisponibles);
  const animTour360     = useAnimatedCounter(habitacionesConTour360);

  const logoSrc = isDark ? '/modooscuro.png' : '/modoclaro.png';

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;

  return (
    <div className="min-h-screen bg-brand-sand dark:bg-gray-950 animate-fade-in-soft transition-colors duration-300">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-mist dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-fade-up">
        <div className="flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 transition-transform duration-200 hover:scale-105">
            <img src={logoSrc} alt="H&H Logo" className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide text-brand-charcoal dark:text-gray-100 sm:text-base">
                <span className="text-brand-orange">Residencial</span>
              </p>
              <p className="hidden text-xs text-brand-mist dark:text-gray-500 sm:block">Tu hogar lejos de casa</p>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Toggle dark mode */}
            <button
              onClick={() => toggleTheme()}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-mist/40 bg-brand-orange/10 text-brand-charcoal transition-all duration-200 hover:bg-brand-orange/20 dark:border-gray-600 dark:bg-brand-orange/20 dark:text-gray-300"
            >
              {isDark ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            {esUsuarioSistema && (
              <Link to="/sistema" className="rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110">
                Ir al Sistema
              </Link>
            )}
            {esCliente && (
              <div className="relative">
                <button
                  onClick={() => setMenuUsuarioAbierto(prev => !prev)}
                  aria-expanded={menuUsuarioAbierto}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <SvgIcon name="userCircle" className="h-5 w-5 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{usuario.nombre}</span>
                  <svg className={`h-4 w-4 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-brand-mist/50 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
                    <div className="border-b border-brand-mist/30 px-4 py-3">
                      <p className="text-sm font-semibold text-brand-charcoal dark:text-gray-100">{usuario.nombre} {usuario.apellido}</p>
                      <p className="truncate text-xs text-brand-mist dark:text-gray-500">{usuario.correo}</p>
                    </div>
                    <Link to="/mis-reservas" className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-charcoal dark:text-gray-200 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10" onClick={cerrarMenus}>
                      <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                      Mis Reservas
                    </Link>
                    <Link to="/mi-perfil" className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-charcoal dark:text-gray-200 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10" onClick={cerrarMenus}>
                      <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                      Mi Perfil
                    </Link>
                    <button onClick={handleCerrarSesion} className="flex w-full items-center gap-2.5 border-t border-brand-mist/30 dark:border-gray-700 px-4 py-3 text-left text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <SvgIcon name="logout" className="h-4 w-4 flex-shrink-0" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
            {!usuario && (
              <Link to="/login" className="rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuMovilAbierto(prev => !prev)} aria-expanded={menuMovilAbierto} className="rounded-lg p-2 text-brand-charcoal dark:text-gray-300 md:hidden" aria-label="Menú">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuMovilAbierto
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuMovilAbierto && (
          <div className="border-t border-brand-mist/40 dark:border-gray-700 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {/* Toggle dark mode - móvil */}
              <button
                onClick={() => toggleTheme()}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal dark:text-gray-300 hover:bg-brand-orange/5 dark:hover:bg-gray-800"
              >
                {isDark ? (
                  <>
                    <svg className="h-4 w-4 flex-shrink-0 text-brand-mist dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                    Modo claro
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 flex-shrink-0 text-brand-mist dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                    Modo oscuro
                  </>
                )}
              </button>
              {esCliente && (
                <>
                  <div className="rounded-xl bg-brand-orange/10 px-3 py-2">
                    <p className="text-sm font-semibold text-brand-charcoal dark:text-gray-100">{usuario.nombre} {usuario.apellido}</p>
                    <p className="truncate text-xs text-brand-mist dark:text-gray-500">{usuario.correo}</p>
                  </div>
                  <Link to="/mis-reservas" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal dark:text-gray-200 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10" onClick={cerrarMenus}>
                    <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                    Mis Reservas
                  </Link>
                  <Link to="/mi-perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal dark:text-gray-200 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10" onClick={cerrarMenus}>
                    <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                    Mi Perfil
                  </Link>
                  <button onClick={handleCerrarSesion} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <SvgIcon name="logout" className="h-4 w-4 flex-shrink-0" />
                    Cerrar Sesión
                  </button>
                </>
              )}
              {esUsuarioSistema && (
                <Link to="/sistema" className="rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Ir al Sistema
                </Link>
              )}
              {!usuario && (
                <Link to="/login" className="rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header className="relative overflow-hidden bg-brand-sand dark:bg-brand-slate text-brand-charcoal dark:text-white transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-brand-orange blur-3xl animate-soft-float" />
          <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-brand-orange-deep blur-3xl animate-soft-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-brand-orange/30 blur-3xl animate-soft-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="min-w-0 lg:col-span-3">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange sm:text-sm animate-fade-up-delay-1">
                <SvgIcon name="sparkles" className="h-3.5 w-3.5 flex-shrink-0" />
                H&H Residencial — Cochabamba, Bolivia
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-fade-up-delay-2">
                Tu hogar <span className="text-brand-orange">lejos de casa</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-brand-mist sm:text-lg animate-fade-up-delay-3">
                Habitaciones modernas, atención cálida y reservas rápidas. Disfruta del tour virtual 360° y elige la habitación perfecta para tu estadía.
              </p>

              {/* ── CTAs del Hero ── */}
              <div className="mt-6 flex flex-wrap gap-3 animate-fade-up-delay-3">
                <button
                  onClick={scrollAHabitaciones}
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 sm:text-base"
                >
                  <SvgIcon name="search" className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Explorar Habitaciones
                  <SvgIcon name="arrowDown" className="h-4 w-4 opacity-60" />
                </button>
                {habitacionesConTour360 > 0 && (
                  <button
                    onClick={scrollAHabitaciones}
                    className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-brand-orange/40 bg-black/5 dark:bg-white/5 px-6 py-3.5 text-sm font-bold text-brand-charcoal dark:text-white backdrop-blur transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 hover:border-brand-orange sm:text-base"
                  >
                    <SvgIcon name="globe" className="h-5 w-5 text-brand-orange" />
                    Ver Tour 360°
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 animate-fade-up-delay-3">
                {[
                  { icon: 'wifi',    label: 'WiFi rápido' },
                  { icon: 'bell',    label: 'Atención 24/7' },
                  { icon: 'shine',   label: 'Habitaciones impecables' },
                ].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1.5 text-xs sm:text-sm">
                    <SvgIcon name={icon} className="h-3.5 w-3.5 flex-shrink-0 text-brand-orange" />
                    {label}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={scrollAlMapa}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1.5 text-xs sm:text-sm hover:bg-brand-orange/20 transition-colors"
                >
                  <SvgIcon name="mapPin" className="h-3.5 w-3.5 flex-shrink-0 text-brand-orange" />
                  Excelente ubicación
                </button>
              </div>

              {/* ── 3 Contadores animados ── */}
              <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-brand-orange/20 bg-black/5 dark:bg-white/5 p-4 backdrop-blur animate-fade-up-delay-1">
                  <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-brand-mist">Total habitaciones</p>
                  <p className="mt-1 text-2xl font-bold text-brand-charcoal dark:text-white sm:text-3xl">{animTotal}</p>
                </div>
                <div className="rounded-2xl border border-brand-orange/20 bg-black/5 dark:bg-white/5 p-4 backdrop-blur animate-fade-up-delay-2">
                  <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-brand-mist">Disponibles ahora</p>
                  <p className="mt-1 text-2xl font-bold text-brand-orange sm:text-3xl">{animDisponibles}</p>
                </div>
                <div className="rounded-2xl border border-brand-orange/20 bg-black/5 dark:bg-white/5 p-4 backdrop-blur animate-fade-up-delay-3">
                  <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-brand-mist">Tour Virtual 360°</p>
                  <p className="mt-1 text-2xl font-bold text-brand-orange sm:text-3xl">{animTour360}</p>
                </div>
              </div>
            </div>

            {/* Card info lateral */}
            <div className="min-w-0 lg:col-span-2">
              <div className="h-full rounded-3xl border border-brand-orange/20 bg-black/5 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md shadow-2xl animate-fade-up-delay-2">
                <p className="text-xs uppercase tracking-wider text-brand-orange font-semibold">Experiencia H&H</p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black leading-tight text-brand-charcoal dark:text-white">
                  Tu estadía empieza con una gran primera impresión
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-brand-mist">
                  Revisa disponibilidad en tiempo real, compara habitaciones y reserva al instante desde cualquier dispositivo.
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: 'checkCircle', text: 'Confirmación de reserva rápida' },
                    { icon: 'globe',       text: 'Tour virtual 360° para elegir mejor' },
                    { icon: 'creditCard',  text: 'Proceso simple para reservar' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2.5">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/20">
                        <SvgIcon name={icon} className="h-4 w-4 text-brand-orange" />
                      </span>
                      <span className="text-sm text-brand-charcoal/90 dark:text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── ¿POR QUÉ ELEGIRNOS? ── */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center animate-fade-up-delay-1">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              <SvgIcon name="star" className="h-3.5 w-3.5" />
              Nuestras ventajas
            </span>
            <h2 className="text-2xl font-extrabold text-brand-charcoal dark:text-gray-100 sm:text-3xl lg:text-4xl">
              ¿Por qué elegir <span className="text-brand-orange">H&H Residencial</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-gray-400 sm:text-base">
              Más que un alojamiento, una experiencia diseñada para tu comodidad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: 'home',
                title: 'Habitaciones Premium',
                desc: 'Espacios modernos, limpios y confortables pensados para que te sientas como en casa.',
                delay: 'animate-scale-in-delay-1',
              },
              {
                icon: 'shield',
                title: 'Reserva Segura',
                desc: 'Confirmación instantánea y proceso transparente. Tu reserva garantizada.',
                delay: 'animate-scale-in-delay-2',
              },
              {
                icon: 'globe',
                title: 'Tour Virtual 360°',
                desc: 'Recorre las habitaciones antes de reservar. Elige con total confianza.',
                delay: 'animate-scale-in-delay-3',
              },
              {
                icon: 'star',
                title: 'Atención Personalizada',
                desc: 'Servicio 24/7 con un equipo dedicado a hacer tu estadía inolvidable.',
                delay: 'animate-scale-in-delay-4',
              },
            ].map(({ icon, title, desc, delay }) => (
              <div
                key={title}
                className={`group rounded-2xl border border-slate-100 dark:border-gray-700 bg-brand-sand dark:bg-gray-800 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand-orange/30 ${delay}`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                  <SvgIcon name={icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-charcoal dark:text-gray-100">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LISTADO ── */}
      <main ref={habitacionesRef} className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 scroll-mt-20">
        <div className="animate-fade-up-delay-1">
          <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />
        </div>

        {!loading && !error && totalHabitaciones > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up-delay-2">
            <p className="text-sm font-medium text-brand-charcoal dark:text-gray-200 sm:text-base">
              {totalHabitaciones} habitación{totalHabitaciones > 1 ? 'es' : ''} encontrada{totalHabitaciones > 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-semibold text-brand-green dark:text-green-400 sm:text-sm">
              ✓ {habitacionesDisponibles} disponible{habitacionesDisponibles !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* ── Skeleton Loader ── */}
        {loading && (
          <section className="animate-fade-up-delay-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-orange border-t-transparent sm:h-8 sm:w-8" />
              <div>
                <p className="text-base font-semibold text-brand-charcoal dark:text-gray-100 sm:text-lg">Cargando habitaciones...</p>
                <p className="text-sm text-brand-mist">Estamos preparando las mejores opciones para ti.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6 text-center sm:p-8 animate-fade-up-delay-2">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <SvgIcon name="exclamation" className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <p className="mb-4 text-base font-semibold text-red-700 dark:text-red-400 sm:text-lg">{error}</p>
            <button onClick={() => cargarHabitaciones(filtros)} className="rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition hover:brightness-110">
              Reintentar
            </button>
          </section>
        )}

        {!loading && !error && totalHabitaciones > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7">
            {habitaciones.map((habitacion, index) => (
              <div key={habitacion.id_habitacion} className="animate-fade-up" style={{ animationDelay: `${0.15 + index * 0.08}s` }}>
                <HabitacionCard habitacion={habitacion} onReservar={handleReservar} />
              </div>
            ))}
          </section>
        )}

        {!loading && !error && totalHabitaciones === 0 && (
          <section className="rounded-3xl border border-brand-mist/30 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-14 text-center shadow-sm sm:px-8 sm:py-20 animate-fade-up-delay-2">
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-sand dark:bg-gray-800">
                <SvgIcon name="search" className="h-10 w-10 text-brand-mist" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-brand-charcoal dark:text-gray-100 sm:text-3xl">No se encontraron habitaciones</h3>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-500 dark:text-gray-400 sm:text-base">
              Ajusta los filtros para ver más resultados o limpia la búsqueda actual.
            </p>
            <button onClick={() => handleFiltrar({})} className="w-full rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-7 py-3.5 font-semibold text-white transition hover:brightness-110 sm:w-auto">
              Limpiar filtros
            </button>
          </section>
        )}
      </main>

      {/* ── UBICACIÓN ── */}
      <section ref={mapRef} className="mt-16 sm:mt-20 scroll-mt-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center animate-fade-up-delay-1">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              <SvgIcon name="mapPin" className="h-3.5 w-3.5" />
              Cómo llegar
            </span>
            <h2 className="text-2xl font-extrabold text-brand-charcoal dark:text-gray-100 sm:text-3xl lg:text-4xl">
              Estamos en el corazón de <span className="text-brand-orange">Cochabamba</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-gray-400 sm:text-base">
              Ubicación privilegiada, a minutos del centro. Fácil acceso en transporte público o vehículo propio.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-brand-mist/30 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl lg:grid lg:grid-cols-5">

            {/* Panel izquierdo — foto del edificio con overlay */}
            <div className="animate-slide-in-left relative lg:col-span-2 min-h-[320px] overflow-hidden">
              <img
                src="/residencial.jpeg"
                alt="H&H Residencial"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-slate/75" />
              <div className="relative flex h-full flex-col justify-between p-7 text-white sm:p-10">
                <div>
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/20 ring-1 ring-brand-orange/40">
                    <img src="/modooscuro.png" alt="H&H" className="h-9 w-9 object-contain" />
                  </div>
                  <h3 className="text-2xl font-black sm:text-3xl">H&H Residencial</h3>
                  <p className="mt-1 text-sm font-medium text-brand-orange">Cochabamba, Bolivia</p>
                </div>

                <div className="my-8 space-y-5">
                  <InfoRow
                    icon={<SvgIcon name="mapPin" className="h-5 w-5" />}
                    title="Dirección"
                    text="Cochabamba, Bolivia"
                  />
                  <InfoRow
                    icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Atención"
                    text="Lunes a Domingo · 24 horas"
                  />
                  <InfoRow
                    icon={<SvgIcon name="shine" className="h-5 w-5" />}
                    title="Coordenadas"
                    text="-17.2558° S, -64.3610° O"
                  />
                </div>

                <a
                  href="https://maps.app.goo.gl/EBuATGiQt1r8qG9N9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-brand-orange px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl"
                >
                  <SvgIcon name="mapPin" className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Abrir en Google Maps
                  <svg className="h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="mt-5 flex flex-wrap gap-2">
                  {['Zona céntrica', 'Transporte cercano', 'Fácil acceso'].map(chip => (
                    <span key={chip} className="rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-medium text-white">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="animate-slide-in-right relative lg:col-span-3 bg-slate-100 dark:bg-gray-950">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-green-200 dark:ring-green-900" />
                <span className="text-xs font-semibold text-brand-charcoal dark:text-gray-200">H&H Residencial</span>
              </div>
              {/* Degradado sutil en los bordes para integrar el mapa con la tarjeta */}
              <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_40px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
              <iframe
                title="Ubicación H&H Residencial"
                src="https://maps.google.com/maps?q=-17.2557977,-64.3610149&z=18&output=embed"
                className="h-72 w-full sm:h-96 lg:h-full grayscale-[15%] contrast-[1.02] dark:invert dark:hue-rotate-180 dark:brightness-[0.92] dark:contrast-[0.9] dark:grayscale-[10%] transition-[filter] duration-300"
                style={{ minHeight: '400px', border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER MEJORADO ── */}
      <footer className="mt-12 bg-brand-sand dark:bg-brand-slate py-10 text-brand-charcoal dark:text-white sm:mt-14 sm:py-14 animate-fade-in-soft transition-colors duration-300 border-t border-slate-200 dark:border-transparent">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {/* Columna 1: Logo + Descripción */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/modooscuro.png" alt="H&H" className="h-10 w-10 object-contain" />
                <span className="text-lg font-bold sm:text-xl">
                  H&H <span className="text-brand-orange">Residencial</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-brand-mist leading-relaxed max-w-xs">
                Tu hogar lejos de casa en Cochabamba, Bolivia. Habitaciones modernas, cómodas y con la mejor atención para tu estadía.
              </p>
              {/* Redes sociales */}
              <div className="mt-5 flex gap-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-white transition hover:bg-[#25D366] hover:text-white" aria-label="WhatsApp">
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-white transition hover:bg-[#1877F2] hover:text-white" aria-label="Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-white transition hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white" aria-label="Instagram">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>

            {/* Columna 2: Enlaces rápidos */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-orange">Enlaces Rápidos</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={scrollAHabitaciones} className="text-sm text-slate-600 dark:text-brand-mist hover:text-brand-charcoal dark:hover:text-white transition-colors">
                    Ver Habitaciones
                  </button>
                </li>
                <li>
                  <button onClick={scrollAlMapa} className="text-sm text-slate-600 dark:text-brand-mist hover:text-brand-charcoal dark:hover:text-white transition-colors">
                    Nuestra Ubicación
                  </button>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-slate-600 dark:text-brand-mist hover:text-brand-charcoal dark:hover:text-white transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-brand-mist hover:text-brand-charcoal dark:hover:text-white transition-colors">
                    Contactar por WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Contacto */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-orange">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <SvgIcon name="mapPin" className="h-4 w-4 flex-shrink-0 text-brand-orange mt-0.5" />
                  <span className="text-sm text-slate-600 dark:text-brand-mist">Cochabamba, Bolivia</span>
                </li>
                <li className="flex items-start gap-3">
                  <SvgIcon name="phone" className="h-4 w-4 flex-shrink-0 text-brand-orange mt-0.5" />
                  <a href={`tel:+${WHATSAPP_NUMERO}`} className="text-sm text-slate-600 dark:text-brand-mist hover:text-brand-charcoal dark:hover:text-white transition-colors">
                    +{WHATSAPP_NUMERO}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <SvgIcon name="bell" className="h-4 w-4 flex-shrink-0 text-brand-orange mt-0.5" />
                  <span className="text-sm text-slate-600 dark:text-brand-mist">Atención 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 border-t border-black/10 dark:border-white/10 pt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-brand-mist sm:text-sm">&copy; 2026 H&H Residencial. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] animate-whatsapp-pulse sm:h-16 sm:w-16"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </a>

      {mostrarModalReserva && habitacionSeleccionada && (
        <ModalReserva
          habitacion={habitacionSeleccionada}
          onClose={() => { setMostrarModalReserva(false); setHabitacionSeleccionada(null); }}
          onSuccess={handleReservaExitosa}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">{title}</p>
        <p className="mt-0.5 text-sm font-medium text-white/90">{text}</p>
      </div>
    </div>
  );
}

export default Home;
