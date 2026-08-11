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
