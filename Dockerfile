# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY Frontend/frontend/package*.json ./
RUN npm ci
COPY Frontend/frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
# Aseguramos compilar como CommonJS para evitar problemas de imports
COPY Backend/package*.json ./
RUN npm ci --include=dev
COPY Backend/tsconfig*.json ./
COPY Backend/src ./src
RUN npm run build

# Stage 3: Production Runtime (FINAL)
FROM node:20-alpine
LABEL authors="Shado"
WORKDIR /app

# --- CAMBIO: YA NO INSTALAMOS SERVE ---
# RUN npm install -g serve  <-- BORRADO

# Copiar Backend build y dependencias de producción
WORKDIR /app/backend
COPY Backend/package*.json ./
# Aseguramos borrar type: module si existiera para usar CommonJS tranquilo
RUN npm ci --only=production
COPY --from=backend-build /app/backend/dist ./dist

# Copiar Frontend build
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Crear directorio para uploads
RUN mkdir -p /app/backend/uploads

# --- CAMBIO: SOLO EXPONEMOS EL PUERTO 5000 ---
EXPOSE 5000
# ---------------------------------------------

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Script de inicio
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]