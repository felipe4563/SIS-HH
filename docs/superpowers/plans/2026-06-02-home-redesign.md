# H&H Residencial — Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la página principal (`home.jsx`) con la identidad visual de H&H Residencial: hero oscuro Midnight Slate, body en Coastal Sand, acentos Sunset Orange, eliminando toda la funcionalidad de carrito.

**Architecture:** Dark hero + light body. Se modifican 4 archivos: config de Tailwind (colores brand + animaciones), home.jsx (rediseño completo + sin carrito), HabitacionCard.jsx (sin carrito + colores naranja), FiltrosHabitaciones.jsx (colores naranja). No hay cambios de lógica de negocio, solo estilos y eliminación del carrito.

**Tech Stack:** React 18, Tailwind CSS v3, React Router v6, Vite

---

## Paleta de colores de referencia

| Token CSS (Tailwind)  | Hex           | Rol                                      |
|-----------------------|---------------|------------------------------------------|
| `brand-orange`        | `#F0A30A`     | CTA principal, precios, acentos          |
| `brand-orange-deep`   | `#FF6F00`     | Degradado oscuro del naranja             |
| `brand-slate`         | `#1A1D21`     | Hero, footer, overlay ubicación          |
| `brand-sand`          | `#FAF8F5`     | Fondo body (listado, filtros)            |
| `brand-charcoal`      | `#2D3436`     | Texto principal en fondos claros         |
| `brand-green`         | `#2E7D32`     | Badge "Disponible", éxito                |
| `brand-mist`          | `#B0BEC5`     | Bordes, divisores, texto suave           |

---

## Task 1: Tailwind Config — Colores Brand + Animaciones

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Reemplazar tailwind.config.js completo**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange':      '#F0A30A',
        'brand-orange-deep': '#FF6F00',
        'brand-slate':       '#1A1D21',
        'brand-sand':        '#FAF8F5',
        'brand-charcoal':    '#2D3436',
        'brand-green':       '#2E7D32',
        'brand-mist':        '#B0BEC5',
      },
      animation: {
        'fade-in':            'fadeIn 0.3s ease-out',
        'fade-in-up':         'fadeInUp 0.4s ease-out',
        'fade-in-soft':       'fadeInSoft 0.6s ease-out',
        'fade-up':            'fadeUp 0.5s ease-out',
        'fade-up-delay-1':    'fadeUp 0.5s ease-out 0.1s both',
        'fade-up-delay-2':    'fadeUp 0.5s ease-out 0.2s both',
        'fade-up-delay-3':    'fadeUp 0.5s ease-out 0.35s both',
        'soft-float':         'softFloat 4s ease-in-out infinite',
        'pulse-orange':       'pulseOrange 2s ease-in-out infinite',
        'slide-in-left':      'slideInLeft 0.5s ease-out both',
        'slide-in-right':     'slideInRight 0.5s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInSoft: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        softFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseOrange: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(240,163,10,0)' },
          '50%':      { transform: 'scale(1.03)', boxShadow: '0 0 0 6px rgba(240,163,10,0.15)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verificar que Tailwind no arroja errores de config**

Correr desde `frontend/`:
```
npm run dev
```
Esperado: servidor inicia sin errores en consola relacionados a Tailwind.

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "feat: add H&H brand colors and animations to tailwind config"
```

---

## Task 2: HabitacionCard — Eliminar carrito + Estilos naranja

**Files:**
- Modify: `frontend/src/pages/Home/HabitacionCard.jsx`

### Qué eliminar:
- Import de `useCarrito` y `CarritoContext`
- `const { agregarHabitacion, habitaciones } = useCarrito()`
- `const estaEnCarrito = ...`
- `const handleAgregarCarrito = ...`
- State `mostrandoMensaje` y `setMostrandoMensaje`
- Badge "En Carrito" (JSX con `estaEnCarrito`)
- Overlay "Agregado al carrito" (JSX con `mostrandoMensaje`)
- Botón "Agregar al carrito" / "Ya en carrito"
- Ícono `cart` del objeto `ICON_DEFS`

### Qué cambiar de estilo:
- Precio: `text-blue-700` → `text-brand-orange`
- Badge "Disponible": `bg-green-500` → `bg-brand-green`
- Badge "Tour 360°": `from-indigo-600 to-blue-700` → `from-brand-orange-deep to-brand-orange`
- Botón "Reservar Ahora" activo: `from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800` → `from-brand-orange-deep to-brand-orange hover:brightness-110`
- Botón "Ver Tour Virtual 360°": `from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700` → `from-brand-slate to-gray-800 hover:from-gray-800 hover:to-brand-slate`
- Card wrapper: agregar `group` para zoom de imagen, `border-brand-mist`
- Imagen: agregar `transition-transform duration-500 group-hover:scale-105`
- Card hover: `hover:-translate-y-2 hover:shadow-2xl`
- Botón "Reservar Ahora" disponible: agregar `animate-pulse-orange`

- [ ] **Step 1: Reescribir HabitacionCard.jsx**

```jsx
import { useState } from 'react';
import TourVirtual360 from './TourVirtual360';

const ICON_DEFS = {
  globe:        ['M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'],
  check:        ['M4.5 12.75l6 6 9-13.5'],
  checkCircle:  ['M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  xCircle:      ['M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  warnCircle:   ['M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'],
  chevronLeft:  ['M15.75 19.5 8.25 12l7.5-7.5'],
  chevronRight: ['M8.25 4.5l7.5 7.5-7.5 7.5'],
  tag:          ['M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z', 'M6 6h.008v.008H6V6Z'],
  users:        ['M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'],
  building:     ['M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z'],
  calendar:     ['M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'],
};

const SvgIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    {(ICON_DEFS[name] || []).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);

const HabitacionCard = ({ habitacion, onReservar }) => {
  const [imagenActual, setImagenActual] = useState(0);
  const [mostrarTour, setMostrarTour] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/400x300?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/api/uploads/${ruta}`;
  };

  const imagenesNormales = habitacion.imagenes?.filter(img => img.tipo_imagen === 'normal') || [];
  const imagenes360     = habitacion.imagenes?.filter(img => img.tipo_imagen === '360') || [];
  const imagenes        = imagenesNormales.length > 0
    ? imagenesNormales
    : [{ ruta: null, tipo_imagen: 'normal', es_portada: true }];

  const siguienteImagen = () => setImagenActual((prev) => (prev + 1) % imagenes.length);
  const anteriorImagen  = () => setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);

  const estadoBadge = {
    disponible:    { cls: 'bg-brand-green text-white',   icon: 'checkCircle', label: 'Disponible' },
    ocupada:       { cls: 'bg-red-500 text-white',        icon: 'xCircle',     label: 'Ocupada' },
    mantenimiento: { cls: 'bg-yellow-500 text-white',     icon: 'warnCircle',  label: 'Mantenimiento' },
  };
  const badge = estadoBadge[habitacion.estado] ?? estadoBadge.mantenimiento;

  return (
    <>
      {mostrarTour && (
        <TourVirtual360
          imagenes360={imagenes360}
          nombreHabitacion={`Habitación ${habitacion.numero}`}
          onClose={() => setMostrarTour(false)}
        />
      )}

      <div className="group bg-white rounded-3xl border border-brand-mist shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        {/* Galería */}
        <div className="relative h-56 sm:h-64 bg-gray-100 overflow-hidden">
          <img
            src={construirUrlImagen(imagenes[imagenActual]?.ruta)}
            alt={`Habitación ${habitacion.numero}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Error+Imagen'; }}
          />

          {imagenes360.length > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-brand-orange-deep to-brand-orange text-white px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg max-w-[75%]">
              <SvgIcon name="globe" className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Tour 360° Disponible</span>
            </div>
          )}

          {habitacion.estado && (
            <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${badge.cls}`}>
              <SvgIcon name={badge.icon} className="h-3.5 w-3.5 flex-shrink-0" />
              {badge.label}
            </div>
          )}

          {imagenes.length > 1 && (
            <>
              <button onClick={anteriorImagen} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                <SvgIcon name="chevronLeft" className="h-4 w-4" />
              </button>
              <button onClick={siguienteImagen} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                <SvgIcon name="chevronRight" className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {imagenes.map((_, index) => (
                  <button key={index} onClick={() => setImagenActual(index)}
                    className={`h-2 rounded-full transition-all ${index === imagenActual ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-charcoal tracking-tight">
                Habitación {habitacion.numero}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <SvgIcon name="tag" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                {habitacion.tipo.nombre}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-extrabold text-brand-orange">
                Bs. {habitacion.precio_total?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-slate-400 font-medium">por noche</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-brand-charcoal bg-brand-sand px-3 py-1 rounded-full border border-brand-mist/50">
              <SvgIcon name="users" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
              {habitacion.tipo.capacidad} personas
            </span>
            <span className="flex items-center gap-1.5 text-sm text-brand-charcoal bg-brand-sand px-3 py-1 rounded-full border border-brand-mist/50">
              <SvgIcon name="building" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
              Piso {habitacion.piso}
            </span>
          </div>

          {habitacion.descripcion && (
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
              {habitacion.descripcion}
            </p>
          )}

          <div className="space-y-2">
            {imagenes360.length > 0 && (
              <button
                onClick={() => setMostrarTour(true)}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-brand-slate to-gray-800 hover:from-gray-800 hover:to-brand-slate text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <SvgIcon name="globe" className="h-5 w-5 text-brand-orange" />
                <span>Ver Tour Virtual 360°</span>
              </button>
            )}

            <button
              onClick={() => onReservar(habitacion)}
              disabled={habitacion.estado !== 'disponible'}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                habitacion.estado === 'disponible'
                  ? 'bg-gradient-to-r from-brand-orange-deep to-brand-orange hover:brightness-110 hover:-translate-y-0.5 text-white animate-pulse-orange'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {habitacion.estado === 'disponible' ? (
                <>
                  <SvgIcon name="calendar" className="h-5 w-5" />
                  <span>Reservar Ahora</span>
                </>
              ) : (
                <span>No Disponible</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HabitacionCard;
```

- [ ] **Step 2: Verificar que no hay referencias a `useCarrito` ni `CarritoContext` en el archivo**

```bash
grep -n "carrito\|Carrito\|useCarrito" frontend/src/pages/Home/HabitacionCard.jsx
```
Esperado: sin resultados.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Home/HabitacionCard.jsx
git commit -m "feat: remove cart from HabitacionCard and apply H&H brand styles"
```

---

## Task 3: FiltrosHabitaciones — Colores Naranja

**Files:**
- Modify: `frontend/src/pages/Home/FiltrosHabitaciones.jsx`

Solo cambios de clase CSS. Lógica 100% intacta.

| Elemento                         | Clase actual                                  | Clase nueva                                        |
|----------------------------------|-----------------------------------------------|----------------------------------------------------|
| Ícono filtro (bg)                | `bg-blue-50 text-blue-600`                    | `bg-brand-orange/10 text-brand-orange`             |
| Badge contador de filtros activos| `bg-blue-600`                                 | `bg-brand-orange`                                  |
| Select/Input focus               | `focus:border-blue-500 focus:ring-blue-100`   | `focus:border-brand-orange focus:ring-brand-orange/20` |
| Tag color "blue"                 | `border-blue-200 bg-blue-50 text-blue-700`    | `border-brand-orange/30 bg-brand-orange/5 text-brand-orange` |

- [ ] **Step 1: Actualizar ícono del header del filtro**

Localizar en `FiltrosHabitaciones.jsx` línea ~40:
```jsx
// ANTES:
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
// DESPUÉS:
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
```

- [ ] **Step 2: Actualizar badge de contador de filtros activos**

Localizar línea ~47:
```jsx
// ANTES:
<span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
// DESPUÉS:
<span className="rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
```

- [ ] **Step 3: Actualizar clases focus de inputs y selects (4 elementos)**

Reemplazar en los 4 controles (2 `<select>` + 2 `<input type="number">`):
```
focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
```
→
```
focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20
```

- [ ] **Step 4: Actualizar el Tag de color "blue"**

Localizar la función `Tag` al final del archivo (~línea 182):
```jsx
// ANTES:
blue:    'border-blue-200 bg-blue-50 text-blue-700',
// DESPUÉS:
blue:    'border-brand-orange/30 bg-brand-orange/5 text-brand-orange',
```

- [ ] **Step 5: Verificar que no quedan clases `blue` residuales (excepto emerald que se mantiene)**

```bash
grep -n "blue" frontend/src/pages/Home/FiltrosHabitaciones.jsx
```
Esperado: sin resultados (solo emerald/green para el toggle "Solo disponibles" que no cambia).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Home/FiltrosHabitaciones.jsx
git commit -m "feat: apply H&H brand orange to FiltrosHabitaciones"
```

---

## Task 4: home.jsx — Rediseño Completo

**Files:**
- Modify: `frontend/src/pages/home.jsx`

### Eliminar antes de rediseñar:
- `import ModalCarrito from '../pages/Home/ModalCarrito'`
- `import BotonCarrito from '../pages/Home/BotonCarrito'`
- `const [mostrarModalCarrito, setMostrarModalCarrito] = useState(false)`
- `const handleReservaMultipleExitosa = () => { ... }`
- En `useEffect`: bloque `if (location.state?.reabrirCarrito || location.state?.completarReserva)`
- JSX: `<ModalCarrito ... />` y `<BotonCarrito ... />`

- [ ] **Step 1: Reemplazar home.jsx completo**

```jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
};

const SvgIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    {(ICON_DEFS[name] || []).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);
/* ────────────────────────────────────────────────────────────────────────── */

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const scrollAlMapa = () => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  return (
    <div className="min-h-screen bg-brand-sand animate-fade-in-soft">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-mist bg-white/95 backdrop-blur-md animate-fade-up">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 transition-transform duration-200 hover:scale-105">
            <img src="/logo.png" alt="H&H Logo" className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide text-brand-charcoal sm:text-base">
                H&H <span className="text-brand-orange">Residencial</span>
              </p>
              <p className="hidden text-xs text-brand-mist sm:block">Tu hogar lejos de casa</p>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-4 md:flex">
            {esUsuarioSistema && (
              <Link to="/sistema" className="rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110">
                Ir al Sistema
              </Link>
            )}
            {esCliente && (
              <div className="relative">
                <button
                  onClick={() => setMenuUsuarioAbierto(prev => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange-deep to-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <SvgIcon name="userCircle" className="h-5 w-5 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{usuario.nombre}</span>
                  <svg className={`h-4 w-4 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-brand-mist/50 bg-white shadow-2xl">
                    <div className="border-b border-brand-mist/30 px-4 py-3">
                      <p className="text-sm font-semibold text-brand-charcoal">{usuario.nombre} {usuario.apellido}</p>
                      <p className="truncate text-xs text-brand-mist">{usuario.correo}</p>
                    </div>
                    <Link to="/mis-reservas" className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-orange/5" onClick={cerrarMenus}>
                      <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                      Mis Reservas
                    </Link>
                    <Link to="/mi-perfil" className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-orange/5" onClick={cerrarMenus}>
                      <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                      Mi Perfil
                    </Link>
                    <button onClick={handleCerrarSesion} className="flex w-full items-center gap-2.5 border-t border-brand-mist/30 px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50">
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
          <button onClick={() => setMenuMovilAbierto(prev => !prev)} className="rounded-lg p-2 text-brand-charcoal md:hidden" aria-label="Menú">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuMovilAbierto
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuMovilAbierto && (
          <div className="border-t border-brand-mist/40 px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {esCliente && (
                <>
                  <div className="rounded-xl bg-brand-orange/10 px-3 py-2">
                    <p className="text-sm font-semibold text-brand-charcoal">{usuario.nombre} {usuario.apellido}</p>
                    <p className="truncate text-xs text-brand-mist">{usuario.correo}</p>
                  </div>
                  <Link to="/mis-reservas" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal hover:bg-brand-orange/5" onClick={cerrarMenus}>
                    <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                    Mis Reservas
                  </Link>
                  <Link to="/mi-perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal hover:bg-brand-orange/5" onClick={cerrarMenus}>
                    <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-brand-mist" />
                    Mi Perfil
                  </Link>
                  <button onClick={handleCerrarSesion} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50">
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
      <header className="relative overflow-hidden bg-brand-slate text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-brand-orange blur-3xl animate-soft-float" />
          <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-brand-orange-deep blur-3xl animate-soft-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange sm:text-sm animate-fade-up-delay-1">
                <SvgIcon name="sparkles" className="h-3.5 w-3.5 flex-shrink-0" />
                H&H Residencial — Cochabamba, Bolivia
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-fade-up-delay-2">
                Tu hogar <span className="text-brand-orange">lejos de casa</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-brand-mist sm:text-lg animate-fade-up-delay-3">
                Habitaciones modernas, atención cálida y reservas rápidas. Disfruta del tour virtual 360° y elige la habitación perfecta para tu estadía.
              </p>

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

              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-brand-orange/20 bg-white/5 p-4 backdrop-blur animate-fade-up-delay-2">
                  <p className="text-xs uppercase tracking-wide text-brand-mist">Disponibles ahora</p>
                  <p className="mt-1 text-2xl font-bold text-brand-orange">{habitacionesDisponibles}</p>
                </div>
                <div className="rounded-2xl border border-brand-orange/20 bg-white/5 p-4 backdrop-blur animate-fade-up-delay-3">
                  <p className="text-xs uppercase tracking-wide text-brand-mist">Tour Virtual 360°</p>
                  <p className="mt-1 text-2xl font-bold text-brand-orange">{habitacionesConTour360}</p>
                </div>
              </div>
            </div>

            {/* Card info lateral */}
            <div className="lg:col-span-2">
              <div className="h-full rounded-3xl border border-brand-orange/20 bg-white/5 p-5 sm:p-6 backdrop-blur-md shadow-2xl animate-fade-up-delay-2">
                <p className="text-xs uppercase tracking-wider text-brand-orange font-semibold">Experiencia H&H</p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black leading-tight">
                  Tu estadía empieza con una gran primera impresión
                </h3>
                <p className="mt-3 text-sm sm:text-base text-brand-mist">
                  Revisa disponibilidad en tiempo real, compara habitaciones y reserva al instante desde cualquier dispositivo.
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: 'checkCircle', text: 'Confirmación de reserva rápida' },
                    { icon: 'globe',       text: 'Tour virtual 360° para elegir mejor' },
                    { icon: 'creditCard',  text: 'Proceso simple para reservar' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/20">
                        <SvgIcon name={icon} className="h-4 w-4 text-brand-orange" />
                      </span>
                      <span className="text-sm text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── LISTADO ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="animate-fade-up-delay-1">
          <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />
        </div>

        {!loading && !error && totalHabitaciones > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up-delay-2">
            <p className="text-sm font-medium text-brand-charcoal sm:text-base">
              {totalHabitaciones} habitación{totalHabitaciones > 1 ? 'es' : ''} encontrada{totalHabitaciones > 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-brand-green sm:text-sm">
              ✓ {habitacionesDisponibles} disponible{habitacionesDisponibles !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {loading && (
          <section className="py-16 text-center sm:py-20">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand-orange border-t-transparent sm:h-20 sm:w-20" />
            <p className="text-base font-semibold text-brand-charcoal sm:text-lg">Cargando habitaciones...</p>
            <p className="mt-2 text-sm text-brand-mist">Estamos preparando las mejores opciones para ti.</p>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <SvgIcon name="exclamation" className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <p className="mb-4 text-base font-semibold text-red-700 sm:text-lg">{error}</p>
            <button onClick={() => cargarHabitaciones(filtros)} className="rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition hover:brightness-110">
              Reintentar
            </button>
          </section>
        )}

        {!loading && !error && totalHabitaciones > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7 animate-fade-up-delay-2">
            {habitaciones.map(habitacion => (
              <HabitacionCard key={habitacion.id_habitacion} habitacion={habitacion} onReservar={handleReservar} />
            ))}
          </section>
        )}

        {!loading && !error && totalHabitaciones === 0 && (
          <section className="rounded-3xl border border-brand-mist/30 bg-white px-4 py-14 text-center shadow-sm sm:px-8 sm:py-20 animate-fade-up-delay-2">
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-sand">
                <SvgIcon name="search" className="h-10 w-10 text-brand-mist" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-brand-charcoal sm:text-3xl">No se encontraron habitaciones</h3>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-500 sm:text-base">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              <SvgIcon name="mapPin" className="h-3.5 w-3.5" />
              Cómo llegar
            </span>
            <h2 className="text-2xl font-extrabold text-brand-charcoal sm:text-3xl lg:text-4xl">
              Estamos en el corazón de <span className="text-brand-orange">Cochabamba</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
              Ubicación privilegiada, a minutos del centro. Fácil acceso en transporte público o vehículo propio.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-brand-mist/30 bg-white shadow-2xl lg:grid lg:grid-cols-5">

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
                    <img src="/logo.png" alt="H&H" className="h-9 w-9 object-contain" />
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
                    text="-17.4018° S, -66.1560° O"
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
            <div className="animate-slide-in-right relative lg:col-span-3">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-green-200" />
                <span className="text-xs font-semibold text-brand-charcoal">H&H Residencial</span>
              </div>
              <iframe
                title="Ubicación H&H Residencial"
                src="https://maps.google.com/maps?q=H%26H+Residencial+Cochabamba+Bolivia&z=17&output=embed"
                className="h-72 w-full sm:h-96 lg:h-full"
                style={{ minHeight: '400px', border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-12 bg-brand-slate py-7 text-white sm:mt-14 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-center gap-2">
            <img src="/logo.png" alt="H&H" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold sm:text-xl">
              H&H <span className="text-brand-orange">Residencial</span>
            </span>
          </div>
          <p className="text-xs text-brand-mist sm:text-sm">&copy; 2026 H&H Residencial. Todos los derechos reservados.</p>
        </div>
      </footer>

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
```

- [ ] **Step 2: Verificar que no hay referencias a carrito en home.jsx**

```bash
grep -n "carrito\|Carrito\|BotonCarrito\|ModalCarrito\|reabrirCarrito\|completarReserva\|mostrarModalCarrito" frontend/src/pages/home.jsx
```
Esperado: sin resultados.

- [ ] **Step 3: Verificar que el servidor corre sin errores**

```bash
cd frontend && npm run dev
```
Abrir `http://localhost:5173` y verificar:
- [ ] Logo H&H visible en navbar
- [ ] Hero en fondo oscuro `#1A1D21`
- [ ] Acentos naranja en badge, números de stats, chips
- [ ] Cards de habitación con fondo blanco sobre fondo arena
- [ ] Sin botón de carrito en ningún lugar
- [ ] Sección ubicación con foto del edificio + overlay oscuro
- [ ] Footer en fondo oscuro con logo

- [ ] **Step 4: Resolver URL del mapa (si el query string no ubica bien)**

Si el mapa no muestra la ubicación correcta, reemplazar el `src` del iframe:
```
src="https://maps.google.com/maps?q=H%26H+Residencial+Cochabamba+Bolivia&z=17&output=embed"
```
por el embed con coordenadas exactas (obtener abriendo `https://maps.app.goo.gl/EBuATGiQt1r8qG9N9`, copiar coordenadas de la URL resultante):
```
src="https://maps.google.com/maps?q=<LAT>,<LNG>&z=17&output=embed"
```

- [ ] **Step 5: Commit final**

```bash
git add frontend/src/pages/home.jsx
git commit -m "feat: complete H&H Residencial home redesign — dark hero, brand colors, no cart"
```

---

## Self-Review: Cobertura del Spec

| Requisito del spec                              | Tarea que lo implementa           |
|-------------------------------------------------|-----------------------------------|
| Colores brand en tailwind.config.js             | Task 1                            |
| Animaciones (8 keyframes nuevos)                | Task 1                            |
| Navbar con logo H&H Residencial                 | Task 4 — sección NAV              |
| Hero Midnight Slate con acentos naranja         | Task 4 — sección HERO             |
| Chips de servicios naranja                      | Task 4 — sección HERO             |
| Stats con número en naranja                     | Task 4 — sección HERO             |
| Card info lateral con border naranja            | Task 4 — sección HERO             |
| Body en Coastal Sand                            | Task 4 — sección LISTADO          |
| Spinner de carga en naranja                     | Task 4 — sección LISTADO          |
| HabitacionCard sin carrito                      | Task 2                            |
| Precio en naranja                               | Task 2                            |
| Badge Disponible en Palm Green                  | Task 2                            |
| Badge Tour 360° en naranja                      | Task 2                            |
| Botón Reservar Ahora naranja + pulse            | Task 2                            |
| Zoom imagen en hover                            | Task 2                            |
| Panel ubicación con residencial.jpeg            | Task 4 — sección UBICACIÓN        |
| Overlay oscuro sobre foto                       | Task 4 — sección UBICACIÓN        |
| Link Google Maps nueva URL                      | Task 4 — sección UBICACIÓN        |
| slide-in-left/right en panel mapa               | Task 4 — sección UBICACIÓN        |
| Footer Midnight Slate con logo                  | Task 4 — sección FOOTER           |
| FiltrosHabitaciones colores naranja             | Task 3                            |
