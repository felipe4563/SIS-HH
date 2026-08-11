# Dockerización y script de deploy — Hostal Suri (SIS-HH)

**Fecha:** 2026-08-10
**Estado:** Aprobado por el usuario en brainstorming, pendiente de plan de implementación.

## Contexto

El proyecto SIS-HH (Hostal Suri) es un sistema de gestión de hostal con:
- **Backend**: Node.js + Express 5, MySQL (mysql2), JWT + Google OAuth, escucha en `PORT` (default 4000), rutas montadas bajo `/api/*`.
- **Frontend**: React + Vite + Tailwind, PWA, tour virtual 360°.
- **BD**: MySQL, dump inicial en `bd/bd_hostal_nuevo.sql`.

Actualmente corre en un VPS sin Docker (commits previos "vps", "fin"). El VPS ya aloja otros subdominios de `rusoft.dev` con un **nginx de sistema** (fuera de Docker) que gestiona TLS (Let's Encrypt) y el enrutamiento por dominio. El nuevo dominio para este proyecto será **`hyh.rusoft.dev`**.

## Objetivo

Dockerizar el proyecto completo (backend, frontend, MySQL) y proveer un script `deploy.sh` que permita actualizar el sitio en producción con un solo comando: `git pull` + rebuild + restart de contenedores, sin tocar los datos persistentes (MySQL, uploads).

## Arquitectura

```
Internet
   │  (TLS, dominio hyh.rusoft.dev)
   ▼
nginx del sistema en el VPS (fuera de Docker, YA EXISTE, no se gestiona en este repo)
   │
   ├── location /api/  → proxy_pass http://127.0.0.1:4000/  (contenedor backend)
   └── location /       → proxy_pass http://127.0.0.1:8080/  (contenedor frontend)

docker-compose (en el repo, en el VPS):
   frontend (nginx:alpine sirviendo dist/) ──┐
   backend  (node:20-alpine, Express)  ──────┼── red interna docker
   db       (mysql:8)  ──────────────────────┘
```

Tres servicios en `docker-compose.yml` en la raíz del repo:

### 1. `db`
- Imagen `mysql:8`.
- Variables desde `.env`: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`.
- Volumen nombrado `db_data:/var/lib/mysql` (persistencia).
- Monta `bd/bd_hostal_nuevo.sql` en `/docker-entrypoint-initdb.d/` — MySQL solo ejecuta estos scripts si el volumen de datos está vacío (primera vez).
- No publica puerto al host (solo accesible desde la red interna de docker-compose).

### 2. `backend`
- `backend/Dockerfile`, imagen base `node:20-alpine`.
- `npm ci --omit=dev`, copia el código fuente, `CMD ["node", "app.js"]`.
- Variables de entorno vía `.env` de la raíz (`DB_HOST=db`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PORT=4000`, `CORS_ORIGINS=https://hyh.rusoft.dev`, etc.).
- Volumen nombrado `uploads_data:/app/uploads` para persistir imágenes de habitaciones entre despliegues/rebuilds.
- Publica `127.0.0.1:4000:4000` (solo loopback del host — el nginx del sistema puede llegar a él, internet no directamente).
- `depends_on: db`.

### 3. `frontend`
- `frontend/Dockerfile`, build multi-stage:
  - Stage 1 (`node:20-alpine`): `npm ci`, `npm run build` con `VITE_API_URL=/api` (ruta relativa — mismo dominio que el backend vía el proxy nginx, evita CORS cross-origin).
  - Stage 2 (`nginx:alpine`): copia `dist/` a `/usr/share/nginx/html`, config nginx simple para servir SPA (`try_files $uri /index.html`).
- Publica `127.0.0.1:8080:80`.

### Red y volúmenes
- Red por defecto de docker-compose (bridge), los 3 servicios se resuelven por nombre de servicio (`db`, `backend`, `frontend`).
- Volúmenes nombrados: `db_data`, `uploads_data`.

## Gestión de entorno

- `.env` en la raíz del repo (git-ignorado ya que `*.env` está en `.gitignore`), consumido por `docker-compose.yml` vía `env_file`.
- `.env.example` en la raíz documentando todas las variables necesarias para crear el `.env` real en el VPS la primera vez.
- `.dockerignore` en `backend/` y `frontend/`: excluye `node_modules`, `.env`, `dist`, `uploads`, `.git`.

## deploy.sh

Ubicado en la raíz del repo, se ejecuta manualmente en el VPS dentro del checkout del repo:

1. `set -euo pipefail`.
2. Verifica que exista `.env` en la raíz (falla con mensaje claro si no).
3. `git pull` sobre la rama actual.
4. `docker compose build` — reconstruye solo las imágenes cuyo contexto cambió (cache de capas de Docker).
5. `docker compose up -d` — recrea únicamente los contenedores cuya imagen cambió; `db` no se toca si no cambió (los datos persisten en el volumen independientemente).
6. `docker image prune -f` — limpia imágenes intermedias huérfanas para no acumular espacio en disco.
7. Imprime el commit hash desplegado y un timestamp a modo de log de auditoría simple.

No hay estrategia de zero-downtime (hay un breve reinicio de `backend`/`frontend` al recrear contenedores); es aceptable para el tamaño de este proyecto. La base de datos nunca se recrea en un deploy porque su ciclo de vida (volumen `db_data`) es independiente del de los contenedores.

## Configuración de nginx del sistema (documentación, no gestionada por este repo)

El nginx externo del VPS debe configurarse manualmente (no forma parte de este repo porque gestiona múltiples subdominios de `rusoft.dev`) con algo equivalente a:

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

Este bloque se documenta en el `README.md`/instrucciones de deploy del repo, pero no se aplica automáticamente.

## Fuera de alcance

- No se configura CI/CD (build/push a un registry) — el build ocurre directamente en el VPS.
- No se gestiona el nginx del sistema ni los certificados TLS desde este repo.
- No hay zero-downtime deployment ni orquestación multi-nodo.
- No se migra la config de WhatsApp (`backend/watsap`, si existiera) — fuera del alcance actual, no mencionado en la exploración del repo.

## Testing / verificación

- `docker compose build` y `docker compose up -d` deben levantar los 3 servicios sin errores en local (con un `.env` de prueba).
- Verificar que el frontend cargue y pueda llamar a `/api/...` a través del proxy nginx del contenedor frontend o directamente contra el backend en desarrollo.
- Verificar que los datos de MySQL persistan tras `docker compose down && docker compose up -d` (sin `-v`).
- Verificar que `deploy.sh` falle limpiamente si falta `.env`.
