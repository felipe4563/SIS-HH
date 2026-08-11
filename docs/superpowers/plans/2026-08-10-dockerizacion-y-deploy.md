# Dockerización y Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dockerizar SIS-HH (backend Express, frontend React/Vite, MySQL) en 3 contenedores orquestados con docker-compose, y proveer un `deploy.sh` para actualizar el sitio en el VPS (`hyh.rusoft.dev`) con `git pull` + rebuild + restart, sin perder datos de MySQL ni de uploads.

**Architecture:** `docker-compose.yml` en la raíz define `db` (mysql:8 con volumen persistente e init desde `bd/bd_hostal_nuevo.sql`), `backend` (node:20-alpine ejecutando Express en :4000, volumen persistente para `uploads/`) y `frontend` (build multi-stage de Vite servido por `nginx:alpine` en :80, con un proxy interno de `/uploads/` hacia `backend` para que las imágenes funcionen bajo el mismo origen). El nginx del sistema del VPS (fuera de este repo) enruta `hyh.rusoft.dev/api/*` → contenedor backend (127.0.0.1:4000) y el resto → contenedor frontend (127.0.0.1:8080).

**Tech Stack:** Docker, docker-compose (Compose v2 `docker compose`), Node 20 (alpine), MySQL 8, nginx (alpine), bash.

## Global Constraints

- El dominio de producción es `hyh.rusoft.dev`; la API vive bajo `hyh.rusoft.dev/api/*` (mismo origen que el frontend, spec: "hyh.rusoft.dev/api/* → backend").
- MySQL corre en un contenedor propio del compose con volumen nombrado persistente; su ciclo de vida es independiente del de `backend`/`frontend` (spec: "Contenedor MySQL en el mismo docker-compose").
- `deploy.sh` hace `git pull` + `docker compose build` + `docker compose up -d`, nunca debe recrear el volumen de datos (spec: "git pull + rebuild + restart contenedores").
- Los contenedores `backend` y `frontend` publican sus puertos solo en `127.0.0.1` del host — el único punto de entrada público es el nginx de sistema del VPS, que no se gestiona desde este repo.
- Nombre de base de datos: `bd_hostal` (coincide con el dump `bd/bd_hostal_nuevo.sql`, que no incluye `CREATE DATABASE`/`USE` y se ejecuta ya-seleccionada la BD vía `MYSQL_DATABASE`).
- No se toca la lógica de negocio de la aplicación (rutas, controladores, etc.) — solo empaquetado/infra.

---

## File Structure

Archivos nuevos:
- `.env.example` — raíz, documenta todas las variables para compose.
- `backend/Dockerfile`
- `backend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/nginx.conf`
- `docker-compose.yml` — raíz
- `deploy.sh` — raíz

Archivos modificados:
- `.gitignore` — asegurar que `.env` en la raíz (ya cubierto por `*.env`) y que `docker-compose.override.yml` opcional queden ignorados si se crean localmente (verificar, no necesariamente cambiar).

No se modifica código de aplicación (`backend/app.js`, rutas, etc.) ni `bd/bd_hostal_nuevo.sql`.

---

## Task 1: Variables de entorno raíz y `.dockerignore`

**Files:**
- Create: `.env.example`
- Create: `backend/.dockerignore`
- Create: `frontend/.dockerignore`

**Interfaces:**
- Produces: nombres exactos de variables de entorno que Task 3 (docker-compose.yml) y Task 4 (deploy.sh) consumen: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`, `HOST`, `CORS_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VITE_GOOGLE_CLIENT_ID`, `RED_ENLACE_USERNAME`, `RED_ENLACE_ACCOUNT_ID`, `RED_ENLACE_KEY_WEBSERVICE`, `RED_ENLACE_ENVIRONMENT`.

- [ ] **Step 1: Crear `.env.example` en la raíz**

```
# ==== MySQL (contenedor db) ====
MYSQL_ROOT_PASSWORD=changeme_root
MYSQL_DATABASE=bd_hostal
MYSQL_USER=hostal_app
MYSQL_PASSWORD=changeme_app

# ==== Backend (contenedor backend, se conecta a MySQL con el mismo usuario/clave de arriba) ====
DB_HOST=db
DB_PORT=3306
DB_USER=hostal_app
DB_PASSWORD=changeme_app
DB_NAME=bd_hostal
JWT_SECRET=changeme_jwt_secret
PORT=4000
HOST=0.0.0.0
CORS_ORIGINS=https://hyh.rusoft.dev
FRONTEND_URL=https://hyh.rusoft.dev
BACKEND_URL=https://hyh.rusoft.dev/api

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RED_ENLACE_USERNAME=
RED_ENLACE_ACCOUNT_ID=
RED_ENLACE_KEY_WEBSERVICE=
RED_ENLACE_ENVIRONMENT=production

# ==== Frontend (build-time, contenedor frontend) ====
VITE_GOOGLE_CLIENT_ID=
```

- [ ] **Step 2: Crear `backend/.dockerignore`**

```
node_modules
npm-debug.log
.env
.env.example
uploads
test
```

- [ ] **Step 3: Crear `frontend/.dockerignore`**

```
node_modules
dist
.env
.env.example
```

- [ ] **Step 4: Commit**

```bash
git add .env.example backend/.dockerignore frontend/.dockerignore
git commit -m "chore: add root .env.example and dockerignore files"
```

---

## Task 2: Dockerfile del backend

**Files:**
- Create: `backend/Dockerfile`

**Interfaces:**
- Consumes: variables de entorno de Task 1 (`DB_HOST=db`, etc.) inyectadas en runtime por docker-compose (Task 5), no en build time.
- Produces: imagen que expone el puerto `4000` y ejecuta `node app.js` con `WORKDIR /app`; el directorio de subida de archivos queda en `/app/uploads` (coincide con la ruta relativa `uploads/habitaciones` que usa `backend/config/multer.js`, ya que `process.cwd()` dentro del contenedor es `/app`).

- [ ] **Step 1: Crear `backend/Dockerfile`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000

CMD ["node", "app.js"]
```

- [ ] **Step 2: Build de verificación (standalone, sin compose todavía)**

Run: `docker build -t hyh-backend-test ./backend`
Expected: build termina con `exit 0` y el log final muestra la imagen creada (no hay push ni run todavía; solo valida que el Dockerfile compila).

- [ ] **Step 3: Limpiar imagen de prueba**

Run: `docker rmi hyh-backend-test`
Expected: la imagen de prueba se elimina (no queda basura de esta verificación puntual).

- [ ] **Step 4: Commit**

```bash
git add backend/Dockerfile
git commit -m "feat: add backend Dockerfile"
```

---

## Task 3: Dockerfile y nginx.conf del frontend

**Files:**
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`

**Interfaces:**
- Consumes: build args `VITE_API_URL` (fijo en `/api`, ruta relativa al mismo origen) y `VITE_GOOGLE_CLIENT_ID` (viene de la variable de entorno raíz del mismo nombre, ver Task 1); en runtime, `nginx.conf` referencia el hostname de servicio `backend` (definido como nombre de servicio en `docker-compose.yml`, Task 5) para proxyar `/uploads/`.
- Produces: imagen que sirve el SPA en el puerto `80` y proxya internamente `/uploads/*` hacia `http://backend:4000/uploads/*`, de modo que `VITE_BASE_URL` puede quedar vacío (mismo origen) tanto en local (puerto 8080) como en producción (`hyh.rusoft.dev`).

**Contexto importante:** el código fuente (`frontend/src/services/pago.js`, `HabitacionCard.jsx`, `TourVirtual360.jsx`, `ModalCarrito.jsx`, `Misreservas.jsx`, `CalendarioReserva.jsx`) usa `import.meta.env.VITE_BASE_URL` para construir URLs absolutas de imágenes servidas por el backend en `/uploads/...`. Dejando `VITE_BASE_URL` vacío en el build, esas URLs quedan relativas (`/uploads/...`) y el nginx del contenedor frontend las reenvía al backend — así funciona sin importar el dominio externo.

- [ ] **Step 1: Crear `frontend/nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /uploads/ {
        proxy_pass http://backend:4000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 2: Crear `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_BASE_URL=
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

- [ ] **Step 3: Build de verificación (standalone)**

Run: `docker build -t hyh-frontend-test --build-arg VITE_GOOGLE_CLIENT_ID=test-client-id ./frontend`
Expected: build termina con `exit 0`; el stage `build` corre `npm run build` sin errores y el stage final copia `dist/` a la imagen nginx.

- [ ] **Step 4: Limpiar imagen de prueba**

Run: `docker rmi hyh-frontend-test`
Expected: la imagen de prueba se elimina.

- [ ] **Step 5: Commit**

```bash
git add frontend/Dockerfile frontend/nginx.conf
git commit -m "feat: add frontend Dockerfile with nginx SPA + uploads proxy"
```

---

## Task 4: `docker-compose.yml`

**Files:**
- Create: `docker-compose.yml` (raíz)

**Interfaces:**
- Consumes: `backend/Dockerfile` (Task 2), `frontend/Dockerfile` + build args `VITE_API_URL`/`VITE_BASE_URL`/`VITE_GOOGLE_CLIENT_ID` (Task 3), variables del `.env` raíz (Task 1), `bd/bd_hostal_nuevo.sql` (existente).
- Produces: tres servicios nombrados `db`, `backend`, `frontend` en la red por defecto de compose (resolución DNS por nombre de servicio — usado por `frontend/nginx.conf` como `http://backend:4000`); volúmenes nombrados `db_data` y `uploads_data`.

- [ ] **Step 1: Crear `docker-compose.yml`**

```yaml
services:
  db:
    image: mysql:8
    container_name: hyh_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./bd/bd_hostal_nuevo.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 20

  backend:
    build:
      context: ./backend
    container_name: hyh_backend
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DB_HOST: db
    ports:
      - "127.0.0.1:4000:4000"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: /api
        VITE_BASE_URL: ""
        VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID}
    container_name: hyh_frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    depends_on:
      - backend

volumes:
  db_data:
  uploads_data:
```

- [ ] **Step 2: Crear `.env` local de prueba a partir del ejemplo**

Run: `cp .env.example .env`
Expected: se crea `.env` en la raíz (ya cubierto por `*.env` en `.gitignore`, no se commitea).

- [ ] **Step 3: Levantar el stack completo**

Run: `docker compose up -d --build`
Expected: los 3 servicios (`hyh_db`, `hyh_backend`, `hyh_frontend`) quedan `Up`/`running`; verificar con `docker compose ps`.

- [ ] **Step 4: Verificar que MySQL cargó el dump**

Run: `docker compose exec db mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "USE bd_hostal; SHOW TABLES;"` (sustituye `$MYSQL_ROOT_PASSWORD` por el valor real de tu `.env`, ej. `changeme_root`)
Expected: lista de tablas incluyendo `cliente`, `habitacion`, `reserva`, etc. (las definidas en `bd/bd_hostal_nuevo.sql`).

- [ ] **Step 5: Verificar que el backend responde**

Run: `curl -i http://127.0.0.1:4000/api/tipos`
Expected: respuesta HTTP (200 con JSON, o el código que corresponda según auth) — en cualquier caso, no un error de conexión; confirma que el backend arrancó y se conectó a `db`.

- [ ] **Step 6: Verificar que el frontend responde y proxea uploads**

Run: `curl -i http://127.0.0.1:8080/` y luego `curl -i http://127.0.0.1:8080/uploads/habitaciones/`
Expected: la primera devuelve el `index.html` del SPA (200); la segunda devuelve una respuesta del backend (no un 404 de nginx "file not found" del propio contenedor frontend), confirmando que el proxy interno a `backend:4000` funciona.

- [ ] **Step 7: Verificar persistencia de datos tras recrear contenedores**

Run: `docker compose down && docker compose up -d`
Expected: al repetir el Step 4, las tablas y datos siguen presentes (el volumen `db_data` no se recreó porque no se usó `-v`).

- [ ] **Step 8: Apagar el stack de prueba local**

Run: `docker compose down`
Expected: contenedores detenidos y removidos; los volúmenes (`db_data`, `uploads_data`) permanecen (no se usó `-v`).

- [ ] **Step 9: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose.yml orchestrating db, backend and frontend"
```

---

## Task 5: `deploy.sh`

**Files:**
- Create: `deploy.sh`

**Interfaces:**
- Consumes: `docker-compose.yml` (Task 4), `.env` (debe existir ya en el VPS, no lo crea el script).
- Produces: script ejecutable en la raíz del repo que un operador humano corre en el VPS para actualizar el despliegue.

- [ ] **Step 1: Crear `deploy.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "❌ No se encontró .env en $(pwd). Copia .env.example a .env y complétalo antes de desplegar."
  exit 1
fi

echo "▶ Actualizando código (git pull)..."
git pull

echo "▶ Reconstruyendo imágenes modificadas..."
docker compose build

echo "▶ Recreando contenedores necesarios..."
docker compose up -d

echo "▶ Limpiando imágenes huérfanas..."
docker image prune -f

COMMIT=$(git rev-parse --short HEAD)
echo "✅ Deploy completo. Commit desplegado: $COMMIT ($(date '+%Y-%m-%d %H:%M:%S'))"
```

- [ ] **Step 2: Dar permisos de ejecución**

Run: `chmod +x deploy.sh`
Expected: `ls -l deploy.sh` muestra el bit `x` (ej. `-rwxr-xr-x`).

- [ ] **Step 3: Verificar el script en local (dry-run funcional)**

Run: `./deploy.sh`
Expected: como ya existe `.env` local (creado en Task 4, Step 2) y el repo está en un checkout git válido, el script corre `git pull` (puede no traer nada nuevo), reconstruye y levanta los 3 servicios, termina imprimiendo `✅ Deploy completo. Commit desplegado: <hash> (...)`. Confirma con `docker compose ps` que los 3 servicios están `Up`.

- [ ] **Step 4: Apagar el stack de prueba local**

Run: `docker compose down`
Expected: contenedores detenidos; se deja el entorno local limpio tras la verificación.

- [ ] **Step 5: Commit**

```bash
git add deploy.sh
git commit -m "feat: add deploy.sh for git pull + rebuild + restart on the VPS"
```

---

## Task 6: Documentación de despliegue (README)

**Files:**
- Modify: `README.md` (raíz — actualmente solo tiene el título "SIS-HH")

**Interfaces:**
- Consumes: nada de código; documenta el resultado de Tasks 1-5.
- Produces: instrucciones legibles para que un operador humano despliegue por primera vez en el VPS y configure el nginx de sistema.

- [ ] **Step 1: Añadir sección de despliegue a `README.md`**

Añadir al final del archivo (conservando el contenido existente):

```markdown

## Despliegue con Docker (VPS)

### Primer despliegue

1. Clonar el repo en el VPS.
2. Copiar `.env.example` a `.env` y completar todas las variables (contraseñas de MySQL, `JWT_SECRET`, credenciales de Google OAuth, Red Enlace, etc.). **No** commitear este archivo.
3. Ejecutar `docker compose up -d --build`. La primera vez, el contenedor `db` inicializa la base de datos `bd_hostal` desde `bd/bd_hostal_nuevo.sql`.
4. Configurar el nginx del sistema del VPS (fuera de este repo) para enrutar `hyh.rusoft.dev`:

   ```nginx
   server {
       listen 443 ssl;
       server_name hyh.rusoft.dev;

       location /api/ {
           proxy_pass http://127.0.0.1:4000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           proxy_pass http://127.0.0.1:8080/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   (Certificados TLS gestionados aparte, ej. `certbot`.)

### Actualizar el sitio

Desde la raíz del repo en el VPS:

```bash
./deploy.sh
```

Esto hace `git pull`, reconstruye las imágenes que cambiaron y reinicia los contenedores necesarios. Los datos de MySQL y los uploads persisten entre despliegues (volúmenes `db_data` y `uploads_data`).
```

- [ ] **Step 2: Revisión visual**

Run: abrir `README.md` y confirmar que el markdown renderiza correctamente (bloques de código con el lenguaje correcto, sin indentación rota).
Expected: la sección nueva se lee igual que el resto de ejemplos de este plan.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document Docker deployment and deploy.sh usage"
```

---

## Task 7: Verificación end-to-end final

**Files:** ninguno nuevo — solo verificación sobre lo construido en Tasks 1-6.

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: confirmación de que el stack completo funciona de punta a punta antes de darlo por terminado.

- [ ] **Step 1: Levantar el stack limpio desde cero**

Run: `docker compose down -v && docker compose up -d --build` (el `-v` aquí es intencional solo para esta verificación final, para simular un primer despliegue real desde cero — no usar `-v` en despliegues normales del VPS)
Expected: los 3 servicios arrancan sanos; `db` reinicializa el volumen desde el dump SQL.

- [ ] **Step 2: Repetir las verificaciones de Task 4 (Steps 4-6)**

Run: los mismos `curl`/`docker compose exec` de Task 4.
Expected: mismos resultados — tablas cargadas, backend responde, frontend sirve el SPA y proxea `/uploads/`.

- [ ] **Step 3: Simular un deploy incremental**

Hacer un cambio trivial (ej. un comentario) en `backend/app.js`, luego correr `./deploy.sh`.
Expected: el script reconstruye solo la imagen `backend` (el log de `docker compose build` muestra cache hit en `frontend`/`db`), reinicia `backend`, y los datos de MySQL siguen intactos (repetir el `SHOW TABLES` de Task 4 Step 4). Revertir el cambio trivial después de verificar.

- [ ] **Step 4: Apagar y limpiar el entorno de prueba local**

Run: `docker compose down`
Expected: entorno local limpio. (Los volúmenes quedan, lo cual está bien para desarrollo local continuo.)

- [ ] **Step 5: Commit final si hubo ajustes**

Si algún paso de verificación reveló un ajuste necesario en algún archivo de las Tasks 1-6, aplicarlo y commitear con un mensaje descriptivo del fix. Si no hubo ajustes, no se requiere commit en esta tarea.

---

## Self-Review Notes

- **Cobertura del spec:** arquitectura de 3 contenedores (Task 2-4), `.env`/`.dockerignore` (Task 1), `deploy.sh` con git pull + rebuild + restart sin tocar datos (Task 5), documentación del nginx externo (Task 6), persistencia de MySQL y uploads verificada explícitamente (Task 4 Step 7, Task 7). Todo cubierto.
- **Consistencia de nombres:** el servicio `backend` en `docker-compose.yml` (Task 4) coincide con el hostname usado en `frontend/nginx.conf` (Task 3, `http://backend:4000`). Las variables `DB_*` en `.env.example` (Task 1) coinciden exactamente con las que lee `backend/config/db.js` (ya existente, sin cambios). `MYSQL_DATABASE=bd_hostal` coincide con el dump sin `CREATE DATABASE`.
- **Sin placeholders:** todos los archivos de configuración están completos con valores reales o claramente marcados como "changeme_*" para secretos que el operador debe reemplazar (no son TODOs de trabajo pendiente, son secretos intencionales).
