#   S I S - H H  

## Despliegue con Docker (VPS)

### Primer despliegue

1. Clonar el repo en el VPS.
2. Copiar `.env.example` a `.env` y completar todas las variables (contraseñas de MySQL, `JWT_SECRET`, credenciales de Google OAuth, Red Enlace, etc.). **No** commitear este archivo.
3. Ejecutar `docker compose up -d --build`. La primera vez, el contenedor `db` inicializa la base de datos `bd_hostal` desde `bd/bd_hostal_nuevo.sql`.

   > ⚠️ **Si estás migrando un sitio ya en producción** (no es un servidor nuevo): antes de este primer `docker compose up -d --build`, ten en cuenta que `bd/bd_hostal_nuevo.sql` puede estar desactualizado y que el volumen `uploads_data` arranca vacío. Debes:
   > - Exportar la base de datos MySQL en vivo (`mysqldump`) y usar ese export en vez de (o para actualizar) `bd/bd_hostal_nuevo.sql`, o importarlo al contenedor `db` justo después de levantarlo y antes de recibir tráfico real.
   > - Copiar el contenido actual de `backend/uploads/` al volumen `uploads_data` (por ejemplo con `docker cp` o montando temporalmente el directorio antiguo) antes de dar la migración por completa.

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
           client_max_body_size 25m;
           proxy_read_timeout 120s;
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
