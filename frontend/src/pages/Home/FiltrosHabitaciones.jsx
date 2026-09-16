import { useState, useEffect } from 'react';
import { getTiposHabitacion } from '../../services/habitacion';

const FiltrosHabitaciones = ({ onFiltrar, filtrosActivos }) => {
  const [tipos, setTipos] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [filtros, setFiltros] = useState({
    id_tipo: filtrosActivos?.id_tipo || '',
    precio_min: filtrosActivos?.precio_min || '',
    precio_max: filtrosActivos?.precio_max || '',
    capacidad: filtrosActivos?.capacidad || '',
    disponible: filtrosActivos?.disponible || false,
  });

  useEffect(() => {
    getTiposHabitacion()
      .then(setTipos)
      .catch((err) => console.error('Error al cargar tipos:', err));
  }, []);

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onFiltrar(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = { id_tipo: '', precio_min: '', precio_max: '', capacidad: '', disponible: false };
    setFiltros(filtrosVacios);
    onFiltrar(filtrosVacios);
  };

  const filtrosActivos_ = Object.entries(filtros).filter(([k, v]) => v !== '' && v !== false);
  const cantidadActivos = filtrosActivos_.length;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setAbierto(prev => !prev)}
        className="w-full flex items-center justify-between border-b border-slate-100 dark:border-gray-700 px-5 py-4 md:cursor-default transition-colors hover:bg-slate-50 dark:hover:bg-gray-800 md:hover:bg-transparent dark:md:hover:bg-transparent"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-gray-100">Filtros de búsqueda</span>
          {cantidadActivos > 0 && (
            <span className="rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
              {cantidadActivos}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {cantidadActivos > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); limpiarFiltros(); }}
              className="text-xs font-semibold text-slate-400 dark:text-gray-500 transition hover:text-red-500 cursor-pointer"
            >
              Limpiar todo
            </span>
          )}
          {/* Chevron solo en mobile */}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 md:hidden ${abierto ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Controles — colapsable en mobile, siempre visible en desktop */}
      <div className={`transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 md:block ${abierto ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100'}`}>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6">
          {/* Tipo de habitación */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              Tipo
            </label>
            <select
              value={filtros.id_tipo}
              onChange={(e) => handleChange('id_tipo', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-slate-800 dark:text-gray-100 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
            >
              <option value="">Todos los tipos</option>
              {tipos.map((tipo) => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Capacidad */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              Capacidad mínima
            </label>
            <select
              value={filtros.capacidad}
              onChange={(e) => handleChange('capacidad', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-slate-800 dark:text-gray-100 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
            >
              <option value="">Cualquiera</option>
              <option value="1">1 persona</option>
              <option value="2">2 personas</option>
              <option value="3">3 personas</option>
              <option value="4">4+ personas</option>
            </select>
          </div>

          {/* Precio mínimo */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              Precio mín. (Bs.)
            </label>
            <input
              type="number"
              value={filtros.precio_min}
              onChange={(e) => handleChange('precio_min', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-300 dark:placeholder-gray-500 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>

          {/* Precio máximo */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              Precio máx. (Bs.)
            </label>
            <input
              type="number"
              value={filtros.precio_max}
              onChange={(e) => handleChange('precio_max', e.target.value)}
              placeholder="Sin límite"
              min="0"
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-300 dark:placeholder-gray-500 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>

          {/* Solo disponibles */}
          <div className="flex items-end lg:col-span-1">
            <button
              onClick={() => handleChange('disponible', !filtros.disponible)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                filtros.disponible
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                filtros.disponible ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-gray-500'
              }`}>
                {filtros.disponible && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              Solo disponibles
            </button>
          </div>

          {/* Botón buscar */}
          <div className="flex items-end lg:col-span-1">
            <button
              onClick={() => onFiltrar(filtros)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Tags de filtros activos */}
      {cantidadActivos > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-gray-700 px-5 py-3">
          {filtros.id_tipo && (
            <Tag
              label={`Tipo: ${tipos.find((t) => t.id_tipo === parseInt(filtros.id_tipo))?.nombre ?? filtros.id_tipo}`}
              onRemove={() => handleChange('id_tipo', '')}
            />
          )}
          {filtros.capacidad && (
            <Tag label={`${filtros.capacidad}+ persona${filtros.capacidad > 1 ? 's' : ''}`} onRemove={() => handleChange('capacidad', '')} />
          )}
          {filtros.precio_min && (
            <Tag label={`Desde Bs. ${filtros.precio_min}`} onRemove={() => handleChange('precio_min', '')} />
          )}
          {filtros.precio_max && (
            <Tag label={`Hasta Bs. ${filtros.precio_max}`} onRemove={() => handleChange('precio_max', '')} />
          )}
          {filtros.disponible && (
            <Tag label="Solo disponibles" onRemove={() => handleChange('disponible', false)} color="emerald" />
          )}
        </div>
      )}
    </div>
  );
};

const Tag = ({ label, onRemove, color = 'blue' }) => {
  const colors = {
    blue: 'border-brand-orange/30 bg-brand-orange/5 text-brand-orange',
    emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colors[color]}`}>
      {label}
      <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};

export default FiltrosHabitaciones;
