# 🚀 Guía de Deployment con Docker

Esta guía te ayudará a deployar la Plataforma Educativa usando Docker.

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Al menos 2GB de RAM disponible
- Puertos 5000 y 5173 disponibles

## 🏗️ Estructura del Proyecto

```
Plataforma-educativa8/
├── Backend/              # API Node.js + TypeScript
├── Frontend/frontend/    # React + Vite + TypeScript
├── Dockerfile            # Multi-stage build
├── docker-compose.yml    # Orquestación de servicios
├── docker-entrypoint.sh  # Script de inicio
└── .dockerignore         # Archivos excluidos del build
```

## 🔧 Configuración

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.docker.example .env
```

Edita el archivo `.env` con tus valores reales:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=plataforma_educativa
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_secreto_jwt

# OAuth, Email, Cloudinary, etc.
# ... (ver .env.docker.example)
```

### 2. Construcción de la Imagen

#### Opción A: Usando Docker Compose (Recomendado)

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# En modo detached (background)
docker-compose up -d --build
```

#### Opción B: Usando Docker directamente

```bash
# Construir la imagen
docker build -t plataforma-educativa:latest .

# Ejecutar el contenedor
docker run -d \
  --name plataforma-app \
  -p 5000:5000 \
  -p 5173:5173 \
  --env-file .env \
  -v $(pwd)/Backend/uploads:/app/backend/uploads \
  plataforma-educativa:latest
```

## 🎯 Acceso a la Aplicación

Una vez que los contenedores estén corriendo:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Base de Datos**: localhost:5432 (si usas el contenedor de PostgreSQL)

## 📊 Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f app

# Solo base de datos
docker-compose logs -f db
```

### Detener servicios
```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Ejecutar comandos dentro del contenedor
```bash
# Abrir shell en el contenedor
docker-compose exec app sh

# Ejecutar un comando específico
docker-compose exec app node --version
```

### Ver estado de los contenedores
```bash
docker-compose ps
```

## 🔍 Troubleshooting

### Error: Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr ":5000"
netstat -ano | findstr ":5173"

# Cambiar puertos en docker-compose.yml
ports:
  - "3000:5000"  # Puerto externo:interno
  - "3001:5173"
```

### Error: Permisos en uploads/
```bash
# Dar permisos al directorio
chmod -R 777 Backend/uploads/
```

### Reconstruir imagen desde cero
```bash
# Eliminar caché y reconstruir
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos
```bash
docker stats
```

## 🚀 Deployment en Producción

### Para deployment en servidores (VPS, EC2, etc.):

1. **Instalar Docker y Docker Compose en el servidor**

2. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/plataforma-educativa8.git
cd plataforma-educativa8
```

3. **Configurar variables de entorno**
```bash
cp .env.docker.example .env
nano .env  # Editar con valores de producción
```

4. **Configurar dominio (opcional)**
Usar Nginx o Traefik como reverse proxy

5. **Levantar servicios**
```bash
docker-compose up -d --build
```

6. **Configurar SSL con Certbot (opcional)**
```bash
# Si usas Nginx como proxy
sudo certbot --nginx -d tudominio.com
```

### Variables importantes para producción:

```env
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://api.tudominio.com
DB_HOST=tu-db-externa.com  # Si usas DB externa
```

## 📦 Arquitectura Multi-Stage Build

El Dockerfile usa 3 stages:

1. **frontend-build**: Compila el frontend React
2. **backend-build**: Compila el backend TypeScript
3. **production**: Imagen final ligera con ambos servicios

Esto reduce el tamaño final de la imagen significativamente.

## 🔐 Seguridad

- ✅ No incluir archivos `.env` en el repositorio
- ✅ Usar secrets de Docker Swarm o Kubernetes en producción
- ✅ Mantener Docker actualizado
- ✅ Usar imágenes oficiales de Node.js
- ✅ Escanear imágenes con `docker scan plataforma-educativa:latest`

## 📝 Notas Adicionales

- El directorio `uploads/` se monta como volumen para persistir archivos
- Los datos de PostgreSQL se guardan en un volumen Docker
- El frontend se sirve con `serve` en modo SPA
- El backend corre con `tsx` para soporte TypeScript en runtime

## 💡 Tips

- Usar `.dockerignore` para reducir tamaño de build context
- Mantener imágenes pequeñas usando `alpine`
- Usar multi-stage builds para optimizar
- Monitorear logs regularmente
- Hacer backups de volúmenes importantes

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica variables de entorno
3. Asegúrate que los puertos estén disponibles
4. Revisa la documentación de Docker

---

¡Feliz deployment! 🎉

