# Diseño: Rediseño Completo de Home — H&H Residencial

**Fecha:** 2026-06-02  
**Alcance:** `frontend/src/pages/home.jsx` + `frontend/src/pages/Home/HabitacionCard.jsx`  
**Enfoque aprobado:** Dark Hero + Light Body (Opción A)

---

## 1. Paleta de Colores (Brand Colors)

| Token           | Hex           | Uso                                                    |
|-----------------|---------------|--------------------------------------------------------|
| Sunset Orange   | `#F0A30A` → `#FF6F00` | CTAs principales, hover, precios destacados, acentos  |
| Midnight Slate  | `#1A1D21`     | Hero, footer, overlay del panel de ubicación          |
| Coastal Sand    | `#FAF8F5`     | Fondo general del body (listado, filtros)              |
| Charcoal Grey   | `#2D3436`     | Texto principal en secciones claras                   |
| Palm Green      | `#2E7D32`     | Badge "Disponible", alertas de éxito                  |
| Mist Blue       | `#B0BEC5`     | Bordes, divisores, iconos secundarios, texto suave    |
| Tropical White  | `#FFFFFF`     | Texto sobre fondos oscuros, cards de habitación       |

---

## 2. Tailwind Config

Agregar colores personalizados al `tailwind.config.js` bajo `theme.extend.colors`:
- `brand-orange`: `#F0A30A`
- `brand-orange-deep`: `#FF6F00`
- `brand-slate`: `#1A1D21`
- `brand-sand`: `#FAF8F5`
- `brand-charcoal`: `#2D3436`
- `brand-green`: `#2E7D32`
- `brand-mist`: `#B0BEC5`

Agregar animaciones adicionales:
- `animate-fade-in-soft`, `animate-fade-up`, `animate-fade-up-delay-1/2/3`, `animate-soft-float`

---

## 3. Navbar

**Archivo:** `home.jsx` — sección `<nav>`

- Fondo: `bg-white` con borde inferior `border-brand-mist`
- **Logo:** `<img src="/logo.png">` a la izquierda (h-10 w-10 object-contain)
- **Nombre:** texto `"H&H"` en `text-brand-charcoal font-black` + `"Residencial"` en `text-brand-orange`
- Botones de acción (Iniciar Sesión, Ir al Sistema, menú usuario): degradado `from-brand-orange-deep to-brand-orange`, texto blanco
- Menú desplegable de usuario: mismos colores naranja para hover
- Menú móvil (hamburger): mismo esquema naranja

**Sin carrito:** eliminar `BotonCarrito`, `ModalCarrito`, imports y estado `mostrarModalCarrito`.

---

## 4. Hero

**Archivo:** `home.jsx` — sección `<header>`

- Fondo: `bg-brand-slate` (sin degradado azul)
- Blobs decorativos: cambiar de `cyan-300`/`purple-400` a `#F0A30A/20` (naranja suave) y `#FF6F00/10`
- Badge superior: borde `border-brand-orange/30`, fondo `bg-brand-orange/10`, texto `text-brand-orange/90`
  - Texto: `"H&H Residencial"` con ícono sparkles
- **Título:** `"Tu hogar lejos de casa"` — blanco, extrabold, text-5xl/6xl
- **Subtítulo:** texto en `text-brand-mist`
- Chips de servicios (WiFi, Atención 24/7, etc.): borde `border-brand-orange/25`, fondo `bg-brand-orange/10`
- Stats mini cards ("Disponibles ahora", "Tour 360°"): borde `border-brand-orange/20`, fondo `bg-white/5`
  - Número en `text-brand-orange`
- **Card info lateral:**
  - Fondo: `bg-white/5` con borde `border-brand-orange/20`
  - Título de sección: `text-brand-orange` (en vez de cyan)
  - Filas de beneficios con íconos en `text-brand-orange`

---

## 5. Filtros y Listado de Habitaciones

**Archivo:** `home.jsx` — sección `<main>` + `FiltrosHabitaciones.jsx`

- Fondo general: `bg-brand-sand` (`#FAF8F5`)
- **FiltrosHabitaciones:** no se modifica la lógica; solo actualizar estilos:
  - Inputs con `border-brand-mist`, focus `ring-brand-orange`
  - Botón filtrar: degradado naranja
- Contador de resultados: texto `text-brand-charcoal`
- Badge disponibles: `bg-green-50 text-brand-green border-green-100`
- Estado carga (spinner): `border-brand-orange`
- Estado vacío: botón "Limpiar filtros" en naranja

---

## 6. HabitacionCard

**Archivo:** `frontend/src/pages/Home/HabitacionCard.jsx`

### Cambios de lógica:
- **Eliminar** toda la lógica de carrito: `useCarrito`, `agregarHabitacion`, `estaEnCarrito`, `handleAgregarCarrito`, `mostrandoMensaje`
- **Eliminar** el import de `CarritoContext`
- **Eliminar** el botón "Agregar al carrito" y el badge "En Carrito"
- **Eliminar** el overlay "Agregado al carrito"

### Cambios de estilos:
- Card: `bg-white rounded-3xl border border-brand-mist shadow-md hover:shadow-xl`
- **Precio:** `text-brand-orange font-extrabold` (en vez de azul)
- **Badge "Disponible":** `bg-brand-green text-white` con ícono checkCircle
- **Badge "Tour 360°":** degradado naranja `from-brand-orange-deep to-brand-orange`
- **Botón "Reservar Ahora":** degradado `from-brand-orange-deep to-brand-orange`, texto blanco, hover oscurece
- **Botón "No Disponible":** `bg-gray-200 text-gray-400 cursor-not-allowed` (sin cambio)
- **Botón "Ver Tour Virtual 360°":** `from-brand-slate to-gray-800` con acento naranja en ícono

---

## 7. Sección Ubicación

**Archivo:** `home.jsx` — sección `<section ref={mapRef}>`

- **Panel izquierdo (`lg:col-span-2`):**
  - Imagen de fondo: `residencial.jpeg` (foto real del edificio) con overlay `bg-brand-slate/75`
  - Encima del overlay: nombre "H&H Residencial", dirección, horario, coordenadas (misma estructura `InfoRow`)
  - Botón "Abrir en Google Maps": naranja sólido
  - Chips: borde `border-brand-orange/20`

- **Panel derecho (`lg:col-span-3`):**
  - Mapa embebido con URL: `https://maps.app.goo.gl/EBuATGiQt1r8qG9N9`
  - El botón "Abrir en Google Maps" usa `href="https://maps.app.goo.gl/EBuATGiQt1r8qG9N9"`
  - El iframe embed: durante implementación se resuelve el short link para obtener coordenadas exactas; provisionalmente usar `https://maps.google.com/maps?q=H%26H+Residencial+Cochabamba&z=17&output=embed` hasta confirmar coords

- Título de sección: `"Estamos en el corazón de"` + `"Cochabamba"` en `text-brand-orange`

---

## 8. Footer

**Archivo:** `home.jsx` — sección `<footer>`

- Fondo: `bg-brand-slate`
- Logo: `<img src="/logo.png">` pequeño (h-8) + texto `"H&H Residencial"` en blanco
- Copyright: `text-brand-mist`

---

## 9. Animaciones

Agregar al `tailwind.config.js` bajo `theme.extend`:

### Keyframes nuevos
| Nombre keyframe   | Descripción                                              |
|-------------------|----------------------------------------------------------|
| `fadeInSoft`      | opacity 0→1, duración 0.6s ease-out                     |
| `fadeUp`          | opacity 0→1 + translateY(16px→0), duración 0.5s ease-out|
| `softFloat`       | translateY(0→-10px→0) loop infinito, duración 4s ease-in-out |
| `pulseOrange`     | scale 1→1.04→1 con sombra naranja, loop 2s              |
| `slideInLeft`     | opacity 0→1 + translateX(-24px→0), duración 0.5s        |
| `slideInRight`    | opacity 0→1 + translateX(24px→0), duración 0.5s         |

### Clases de animación
| Clase Tailwind              | Uso en pantalla                                           |
|-----------------------------|-----------------------------------------------------------|
| `animate-fade-in-soft`      | Wrapper principal de toda la página                      |
| `animate-fade-up`           | Navbar al cargar                                         |
| `animate-fade-up-delay-1`   | Sección filtros + primer grupo de cards                  |
| `animate-fade-up-delay-2`   | Stats mini + card info lateral del hero                  |
| `animate-fade-up-delay-3`   | Chips de servicios + subtítulo hero                      |
| `animate-soft-float`        | Blobs decorativos del hero (loop)                        |
| `animate-pulse-orange`      | Botón "Reservar Ahora" en cards disponibles (sutil)      |
| `animate-slide-in-left`     | Panel izquierdo de la sección ubicación                  |
| `animate-slide-in-right`    | Panel del mapa en la sección ubicación                   |

### Transiciones en hover
- Cards de habitación: `transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`
- Botones CTA: `transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110`
- Logo en navbar: `transition-transform duration-200 hover:scale-105`
- Botón Google Maps: `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-orange`
- Imagen en card: `transition-transform duration-500 group-hover:scale-105` (efecto zoom suave)

---

## 10. Componentes que NO cambian

- `ModalReserva.jsx` — sin cambios (se abre desde `onReservar`)
- `TourVirtual360.jsx` — sin cambios
- `CalendarioReserva.jsx` — sin cambios
- `AuthContext` — sin cambios

---

## 11. Componentes / imports a eliminar de home.jsx

- `import ModalCarrito from './Home/ModalCarrito'`
- `import BotonCarrito from './Home/BotonCarrito'`
- Estado: `mostrarModalCarrito`, `handleReservaMultipleExitosa`
- Lógica: `location.state?.reabrirCarrito`, `location.state?.completarReserva`
- JSX: `<ModalCarrito>`, `<BotonCarrito>`

---

## 12. Archivos a modificar

1. `frontend/tailwind.config.js` — agregar colores brand y animaciones faltantes
2. `frontend/src/pages/home.jsx` — rediseño completo + eliminar carrito
3. `frontend/src/pages/Home/HabitacionCard.jsx` — eliminar lógica de carrito + nuevos estilos
4. `frontend/src/pages/Home/FiltrosHabitaciones.jsx` — solo actualización de estilos (lógica intacta)

## Archivos de solo lectura (referencia)

- `frontend/public/logo.png` — logo H&H a usar en nav y footer
- `frontend/public/residencial.jpeg` — foto del edificio para panel de ubicación
