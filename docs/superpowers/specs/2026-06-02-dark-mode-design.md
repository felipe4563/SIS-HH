# Diseño: Modo Claro / Modo Oscuro — Vista Pública H&H Residencial

**Fecha:** 2026-06-02
**Alcance:** Vista pública únicamente — `home.jsx`, `HabitacionCard.jsx`, `FiltrosHabitaciones.jsx`
**Enfoque aprobado:** Tailwind `darkMode: 'class'` con clase `dark` en wrapper de `home.jsx`

---

## 1. Arquitectura

### Mecanismo central

- `darkMode: 'class'` en `tailwind.config.js` — habilita el prefijo `dark:` en Tailwind v3
- La clase `dark` se aplica dinámicamente al div raíz de `home.jsx`:
  ```jsx
  <div className={`min-h-screen bg-brand-sand ... ${isDark ? 'dark' : ''}`}>
  ```
- Estado en `home.jsx` con inicialización lazy desde `localStorage`:
  ```js
  const [isDark, setIsDark] = useState(() => localStorage.getItem('hh-theme') === 'dark');
  ```
- Persistencia vía `useEffect`:
  ```js
  useEffect(() => {
    localStorage.setItem('hh-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  ```
- **Scope aislado:** la clase `dark` nunca toca `<html>` ni afecta al sistema interno (Dashboard, Reservas, etc.)

### Archivos a modificar

| Archivo | Tipo de cambio |
|---|---|
| `frontend/tailwind.config.js` | Añadir `darkMode: 'class'` |
| `frontend/src/pages/home.jsx` | Estado + toggle + `dark:` en wrapper, nav, hero, main, footer |
| `frontend/src/pages/Home/HabitacionCard.jsx` | `dark:` en card, fondos, textos |
| `frontend/src/pages/Home/FiltrosHabitaciones.jsx` | `dark:` en contenedor, inputs, selects, tags |

---

## 2. Paleta de Colores

Los acentos `brand-orange` y `brand-orange-deep` se mantienen **idénticos en ambos modos**.
Hero (`bg-brand-slate`) y footer (`bg-brand-slate`) **no cambian** — ya son oscuros y lucen bien en ambos modos.

| Elemento | Modo claro | Modo oscuro |
|---|---|---|
| Body wrapper | `bg-brand-sand` (`#FAF8F5`) | `dark:bg-gray-950` |
| Navbar fondo | `bg-white/95` | `dark:bg-gray-900/95` |
| Navbar borde | `border-brand-mist` | `dark:border-gray-700` |
| Texto nav / logo nombre | `text-brand-charcoal` | `dark:text-gray-100` |
| Subtítulo nav | `text-brand-mist` | `dark:text-gray-500` |
| Menú usuario dropdown | `bg-white` | `dark:bg-gray-900` |
| Dropdown borde | `border-brand-mist/50` | `dark:border-gray-700` |
| Dropdown texto | `text-brand-charcoal` | `dark:text-gray-200` |
| Dropdown hover | `hover:bg-brand-orange/5` | `dark:hover:bg-brand-orange/10` |
| Menú móvil info card | `bg-brand-orange/10` | igual (ya semitransparente) |
| Sección main fondo | `bg-brand-sand` (hereda wrapper) | `dark:bg-gray-950` |
| Cards habitación | `bg-white` | `dark:bg-gray-900` |
| Borde cards | `border-brand-mist` | `dark:border-gray-700` |
| Título habitación | `text-brand-charcoal` | `dark:text-gray-100` |
| Texto secundario card | `text-slate-500` | `dark:text-gray-400` |
| Chips info card (piso/personas) | `bg-brand-sand` `border-brand-mist/50` | `dark:bg-gray-800 dark:border-gray-600` |
| Descripción habitación | `text-slate-500` | `dark:text-gray-400` |
| "Por noche" label | `text-slate-400` | `dark:text-gray-500` |
| Filtros contenedor | `bg-white border-slate-200` | `dark:bg-gray-900 dark:border-gray-700` |
| Filtros header borde | `border-slate-100` | `dark:border-gray-700` |
| Filtros título | `text-slate-800` | `dark:text-gray-100` |
| Filtros label | `text-slate-500` | `dark:text-gray-400` |
| Inputs / selects | `bg-slate-50 border-slate-200 text-slate-800` | `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100` |
| Tags activos (border-t) | `border-slate-100` | `dark:border-gray-700` |
| "Limpiar todo" btn | `text-slate-400` | `dark:text-gray-500` |
| Panel "sin resultados" | `bg-white border-brand-mist/30` | `dark:bg-gray-900 dark:border-gray-700` |
| Título "sin resultados" | `text-brand-charcoal` | `dark:text-gray-100` |
| Subtitle "sin resultados" | `text-slate-500` | `dark:text-gray-400` |
| Contador resultados | `text-brand-charcoal` | `dark:text-gray-200` |
| Sección ubicación título | `text-brand-charcoal` | `dark:text-gray-100` |
| Subtitle ubicación | `text-slate-500` | `dark:text-gray-400` |
| Panel mapa contenedor | `bg-white border-brand-mist/30` | `dark:bg-gray-900 dark:border-gray-700` |
| Badge "H&H en mapa" | `bg-white/90 border-white/60` | `dark:bg-gray-900/90 dark:border-gray-700` |
| Badge texto | `text-brand-charcoal` | `dark:text-gray-200` |

---

## 3. Toggle Button

### Ubicación
- **Desktop:** a la izquierda de los botones de auth en la navbar
- **Móvil:** primera fila del menú desplegable (hamburger), antes de los links de usuario

### Visual
- Botón circular `h-9 w-9 rounded-full`
- Fondo: `bg-brand-orange/10 border border-brand-mist/40`
- Modo oscuro activo: `dark:bg-brand-orange/20 dark:border-gray-600`
- Hover: `hover:bg-brand-orange/20`
- Transición: `transition-all duration-200`
- **Modo claro → muestra ícono luna** (click activa dark)
- **Modo oscuro → muestra ícono sol** (click activa light)

### Íconos SVG (inline, sin librerías)

**Sol:**
```jsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
</svg>
```

**Luna:**
```jsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
</svg>
```

### Persistencia
- Clave `localStorage`: `hh-theme`
- Valores: `'dark'` | `'light'`
- Default: `'light'` (si no hay clave guardada)
- Sin parpadeo: `useState(() => localStorage.getItem('hh-theme') === 'dark')` (inicialización lazy)

---

## 4. Comportamiento por Sección

### Navbar
- Fondo cambia `bg-white/95` → `dark:bg-gray-900/95`
- Logo nombre: `H&H` en `dark:text-gray-100`, `Residencial` en naranja (sin cambio)
- Subtítulo "Tu hogar lejos de casa": `dark:text-gray-500`
- Dropdown usuario: `dark:bg-gray-900`, links con `dark:text-gray-200`, hover `dark:hover:bg-brand-orange/10`
- Toggle button visible en desktop y móvil

### Hero
- **No cambia** — `bg-brand-slate` ya es modo oscuro
- Los blobs naranja, el badge, el título, los chips se ven igual

### Listado / Main
- Body hereda `dark:bg-gray-950` del wrapper
- Spinner ya usa `border-brand-orange` (sin cambio)
- Contador resultados: `dark:text-gray-200`
- Badge disponibles: ya usa `bg-green-50 text-brand-green` — añadir `dark:bg-green-900/20 dark:text-green-400`

### HabitacionCard
- Card: `dark:bg-gray-900 dark:border-gray-700`
- Título habitación: `dark:text-gray-100`
- Badge tour 360° / disponible: sin cambio (naranja/verde sólido)
- Precio: `text-brand-orange` (sin cambio)
- Texto tipo, descripción: `dark:text-gray-400`
- Chips piso/personas: `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300`
- Botones CTA: naranja y slate ya tienen buen contraste (sin cambio)

### FiltrosHabitaciones
- Contenedor: `dark:bg-gray-900 dark:border-gray-700`
- Título, labels: `dark:text-gray-100`, `dark:text-gray-400`
- Inputs/selects: `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100`
- Placeholder: `dark:placeholder-gray-500`
- Tags activos: borde y fondo naranja ya usan opacity (sin cambio visual significativo)
- Botón "Solo disponibles" inactivo: `dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400`

### Sección Ubicación
- Título y subtítulo: `dark:text-gray-100` / `dark:text-gray-400`
- Panel contenedor: `dark:bg-gray-900 dark:border-gray-700`
- Panel izquierdo (foto edificio): sin cambio — tiene overlay `bg-brand-slate/75`
- Badge "H&H Residencial" sobre mapa: `dark:bg-gray-900/90 dark:border-gray-700 dark:text-gray-200`

### Footer
- **No cambia** — ya es `bg-brand-slate`

---

## 5. Archivos a modificar (resumen)

1. `frontend/tailwind.config.js` — línea nueva: `darkMode: 'class'`
2. `frontend/src/pages/home.jsx` — estado, efecto, toggle button (desktop + móvil), clases `dark:` en 8 secciones
3. `frontend/src/pages/Home/HabitacionCard.jsx` — clases `dark:` en card wrapper, texto, chips
4. `frontend/src/pages/Home/FiltrosHabitaciones.jsx` — clases `dark:` en contenedor, inputs, selects, botón "Solo disponibles"

## 6. Lo que NO cambia

- `AuthContext`, `CarritoContext` (intactos)
- Sistema interno: `MainLayout`, `Dashboard`, `Reservas`, etc. — sin tocar
- `ModalReserva`, `TourVirtual360`, `CalendarioReserva` — sin tocar
- Colores `brand-orange` / `brand-orange-deep` en CTAs — igual en ambos modos
- Hero y footer (`bg-brand-slate`) — sin cambio
