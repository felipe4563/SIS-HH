import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { Outlet, useLocation, Link } from 'react-router-dom';

/* ── SVG Icon components ── */
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z
         M14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z
         M4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z
         M14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const IconBed = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 20v-5m0 0h18m-18 0v-3a3 3 0 013-3h12a3 3 0 013 3v3
         M7 12V9a2 2 0 012-2h2a2 2 0 012 2v3
         M3 20h18" />
  </svg>
);

const IconTag = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M7 7h.01M3 5.5V11l9.293 9.293a1 1 0 001.414 0l6.293-6.293a1 1 0 000-1.414L10.707 3.5A1 1 0 0010 3H4.5A1.5 1.5 0 003 4.5v1z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconPerson = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
         M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
         m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z
         M21 10a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04
         A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
         0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z
         m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2
         m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconCrown = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 19l2.5-11L9 13l3-9 3 9 4.5-5L22 19H2z" />
  </svg>
);

const IconLogout = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconHome = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3
         m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconBroom = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 21l6-6m0 0l2-8 7-7-9 9m-2 6l-2-2m2 2l2 2M9 15l-2 2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 3l2 2-9 9-2-2 9-9z" />
  </svg>
);

const IconMenu = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconClose = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconSun = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const IconMoon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

/* ─────────────────────────────────────────── */

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const cerrarSidebar = () => setSidebarAbierto(false);

  const menuItems = [
    { name: 'Dashboard',    icon: <IconDashboard />, path: '/sistema',              action: 'read', subject: 'Dashboard'       },
    { name: 'Habitaciones', icon: <IconBed />,       path: '/sistema/habitaciones', action: 'read', subject: 'Habitacion'      },
    { name: 'Tipos',        icon: <IconTag />,       path: '/sistema/tipos',        action: 'read', subject: 'TipoHabitacion'  },
    { name: 'Reservas',     icon: <IconCalendar />,  path: '/sistema/reservas',     action: 'read', subject: 'Reserva'         },
    { name: 'Clientes',     icon: <IconPerson />,    path: '/sistema/clientes',     action: 'read', subject: 'Cliente'         },
    { name: 'Usuarios',     icon: <IconUsers />,     path: '/sistema/usuarios',     action: 'read', subject: 'Usuario'         },
    { name: 'Roles',        icon: <IconShield />,    path: '/sistema/roles',        action: 'read', subject: 'Role'            },
    { name: 'Reportes',     icon: <IconChart />,     path: '/sistema/reportes',     action: 'read', subject: 'Reporte'         },
    { name: 'Limpieza',     icon: <IconBroom />,     path: '/sistema/limpieza',     action: 'read', subject: 'Limpieza'         },
  ];

  const menuFiltrado = menuItems.filter(item => ability?.can(item.action, item.subject));

  const isActive = (path) => {
    if (path === '/sistema') return location.pathname === '/sistema';
    return location.pathname.startsWith(path);
  };

  const getRolDisplay = () => usuario?.nombre_rol || 'Usuario';
  const getInitials = () => usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
  const getPageTitle = () => menuFiltrado.find(item => isActive(item.path))?.name || 'Sistema';
  const logoSrc = isDark ? '/modooscuro.png' : '/modoclaro.png';

  return (
    <div className="flex h-screen bg-brand-sand dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar — empuja el contenido al abrir/cerrar, el usuario decide si lo muestra */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ${
          sidebarAbierto ? 'w-72' : 'w-0'
        }`}
      >
        <div className="w-72 h-full bg-white dark:bg-gray-900 shadow-md border-r border-brand-mist/30 dark:border-white/10 flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-brand-mist/30 dark:border-white/10">
            <Link to="/" className="flex min-w-0 items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src={logoSrc} alt="H&H Logo" className="h-9 w-9 flex-shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-wide text-brand-charcoal dark:text-white">
                  H&H <span className="text-brand-orange">Residencial</span>
                </p>
                <p className="text-xs text-brand-mist dark:text-white/50">Sistema de Gestión</p>
              </div>
            </Link>
            <button
              onClick={cerrarSidebar}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-mist dark:text-white/50 hover:bg-brand-orange/10 dark:hover:bg-white/10 hover:text-brand-charcoal dark:hover:text-white transition-colors"
              aria-label="Cerrar menú"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {menuFiltrado.length > 0 ? (
              menuFiltrado.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                      : 'text-brand-charcoal/70 dark:text-white/70 hover:bg-brand-orange/10 dark:hover:bg-white/10 hover:text-brand-charcoal dark:hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                </Link>
              ))
            ) : (
              <div className="text-brand-mist dark:text-white/50 text-sm text-center py-4">
                No hay módulos disponibles
              </div>
            )}

            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-brand-charcoal/70 dark:text-white/70 hover:bg-brand-orange/10 dark:hover:bg-white/10 hover:text-brand-charcoal dark:hover:text-white transition-all duration-200 mt-2 border-t border-brand-mist/20 dark:border-white/10 pt-4"
            >
              <IconHome className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm whitespace-nowrap">Página Principal</span>
            </Link>
          </nav>

          {/* Toggle de tema */}
          <div className="px-3 pb-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-brand-charcoal/70 dark:text-white/70 hover:bg-brand-orange/10 dark:hover:bg-white/10 hover:text-brand-charcoal dark:hover:text-white transition-colors"
            >
              {isDark ? <IconSun className="h-5 w-5 flex-shrink-0" /> : <IconMoon className="h-5 w-5 flex-shrink-0" />}
              <span className="font-medium text-sm whitespace-nowrap">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>

          {/* Información del Usuario y Logout */}
          <div className="p-3 border-t border-brand-mist/30 dark:border-white/10">
            <div className="flex items-center gap-2.5 mb-3 p-2 rounded-xl bg-brand-sand dark:bg-white/5">
              <div className="w-9 h-9 flex-shrink-0 bg-brand-orange rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-brand-charcoal dark:text-white text-sm font-semibold truncate">{usuario?.nombre || 'Usuario'}</p>
                <p className="text-brand-mist dark:text-white/50 text-xs capitalize truncate font-medium">{getRolDisplay()}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2.5 bg-red-500 hover:bg-red-600 text-white py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors duration-200"
            >
              <IconLogout className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-brand-mist/30 dark:border-gray-700">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
              <button
                onClick={() => setSidebarAbierto(prev => !prev)}
                className="p-1 sm:p-2 text-brand-charcoal dark:text-gray-300 hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all duration-300 flex-shrink-0 active:scale-95"
                aria-label={sidebarAbierto ? 'Cerrar menú' : 'Abrir menú'}
              >
                <IconMenu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-brand-charcoal dark:text-gray-100 truncate">
                  {getPageTitle()}
                </h2>
                <p className="text-brand-mist dark:text-gray-500 text-xs sm:text-sm truncate font-medium">Sistema de Gestión Hotelera</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-mist/40 dark:border-gray-600 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-charcoal dark:text-gray-300 transition-all duration-200 hover:bg-brand-orange/20"
              >
                {isDark ? <IconSun /> : <IconMoon />}
              </button>

              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-brand-sand dark:bg-gray-950 p-3 sm:p-4 md:p-6 transition-colors duration-300">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>

        {/* Footer Móvil */}
        <footer className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-brand-mist/30 dark:border-gray-700 py-2 px-3 sm:px-4 shadow-lg">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1.5">
              <img src={logoSrc} alt="H&H" className="h-5 w-5 object-contain" />
              <span className="font-bold text-brand-charcoal dark:text-gray-200">H&H Residencial</span>
            </div>
            <span className="text-brand-mist dark:text-gray-500 capitalize truncate ml-2 font-medium">{getRolDisplay()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
