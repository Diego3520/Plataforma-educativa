# 📦 Archivos Docker Creados

## ✅ Archivos Principales

### 1. **Dockerfile** (Raíz del proyecto)
Dockerfile multi-stage que construye y empaqueta tanto el frontend (React + Vite) como el backend (Node.js + TypeScript) en una sola imagen optimizada.

**Stages:**
- `frontend-build`: Compila el frontend de React
- `backend-build`: Compila el backend TypeScript
- `production`: Imagen final con Alpine Linux

### 2. **docker-compose.yml** (Raíz del proyecto)
Orquestador de servicios que incluye:
- Contenedor de la aplicación (frontend + backend)
- Contenedor de PostgreSQL (opcional)
- Configuración de redes y volúmenes
- Variables de entorno

### 3. **docker-entrypoint.sh** (Raíz del proyecto)
Script de inicio que:
- Inicia el backend en el puerto 5000
- Sirve el frontend en el puerto 5173
- Maneja señales de terminación correctamente

### 4. **.dockerignore** (Raíz del proyecto)
Define qué archivos excluir del build context:
- node_modules
- Archivos .env
- Tests
- CodeExecutor (no necesario)
- Archivos de desarrollo

### 5. **.env.docker.example** (Raíz del proyecto)
Template de variables de entorno necesarias:
- Base de datos (PostgreSQL)
- JWT secrets
- OAuth (Google, Microsoft)
- Email (SendGrid/Gmail)
- Cloudinary
- URLs de frontend/backend

## 🛠️ Archivos de Utilidad

### 6. **docker-deploy.ps1** (Raíz del proyecto)
Script interactivo de PowerShell para Windows con menú:
- Build y deploy
- Ver logs
- Detener servicios
- Limpiar contenedores
- Verificación de requisitos

### 7. **Makefile** (Raíz del proyecto)
Comandos simplificados para Linux/Mac:
```bash
make build      # Construir imágenes
make up         # Iniciar servicios
make down       # Detener servicios
make logs       # Ver logs
make clean      # Limpiar todo
```

### 8. **nginx.conf.example** (Raíz del proyecto)
Configuración de Nginx para producción:
- Reverse proxy para el backend
- Servir frontend estático
- SSL/HTTPS
- Compresión Gzip
- Cache headers

### 9. **DOCKER-DEPLOYMENT.md** (Raíz del proyecto)
Guía completa de deployment con:
- Requisitos previos
- Instrucciones paso a paso
- Comandos útiles
- Troubleshooting
- Tips de seguridad

## 🚀 Inicio Rápido

### En Windows (PowerShell):
```powershell
# Ejecutar script interactivo
.\docker-deploy.ps1
```

### Manualmente:
```bash
# 1. Copiar y configurar .env
cp .env.docker.example .env
# Editar .env con tus valores

# 2. Build y deploy
docker-compose up --build -d

# 3. Ver logs
docker-compose logs -f

# 4. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

## 📁 Estructura Final

```
Plataforma-educativa8/
├── 🐳 Dockerfile                  # Multi-stage build
├── 🐳 docker-compose.yml          # Orquestación
├── 🐳 docker-entrypoint.sh        # Script de inicio
├── 🐳 .dockerignore               # Exclusiones
├── ⚙️  .env.docker.example         # Template de variables
├── 📖 DOCKER-DEPLOYMENT.md        # Guía completa
├── 🖥️  docker-deploy.ps1           # Script de Windows
├── 🛠️  Makefile                    # Comandos simplificados
├── 🌐 nginx.conf.example          # Config para producción
├── Backend/                       # API Node.js
│   ├── src/
│   ├── uploads/                   # Volumen persistente
│   └── package.json
└── Frontend/frontend/             # React + Vite
    ├── src/
    ├── dist/                      # Build output
    └── package.json
```

## 🔍 Verificación

Para verificar que todo funciona:

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f app

# Ejecutar comando en contenedor
docker-compose exec app sh

# Ver uso de recursos
docker stats
```

## 🎯 Variables de Entorno Requeridas

Asegúrate de configurar en `.env`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `db` o `tu-db.com` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `plataforma_educativa` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password` |
| `JWT_SECRET` | Secret para JWT | `random_secret_key` |
| `GOOGLE_CLIENT_ID` | OAuth Google | `tu_client_id` |
| `SENDGRID_API_KEY` | API Key de SendGrid | `SG.xxxxx` |
| `CLOUDINARY_*` | Credenciales de Cloudinary | Obtener de Cloudinary |

## 📊 Puertos Utilizados

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| `5000` | Backend | API REST + Socket.IO |
| `5173` | Frontend | React SPA |
| `5432` | PostgreSQL | Base de datos (si usas contenedor) |

## ⚠️ Notas Importantes

1. **Seguridad**: Nunca subas el archivo `.env` al repositorio
2. **Uploads**: El directorio `Backend/uploads/` es un volumen persistente
3. **Base de datos**: Los datos de PostgreSQL se guardan en un volumen Docker
4. **CodeExecutor**: No está incluido en el Dockerfile (como solicitaste)
5. **Producción**: Usa Nginx como reverse proxy y configura SSL

## 🆘 Solución de Problemas

### Puerto en uso
```bash
# Ver qué usa el puerto
netstat -ano | findstr ":5000"
# Matar proceso
taskkill /PID <PID> /F
```

### Reconstruir desde cero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ver logs detallados
```bash
docker-compose logs -f --tail=100 app
```

## 📚 Documentación Adicional

- **Guía completa**: Ver `DOCKER-DEPLOYMENT.md`
- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/

---

✅ **Todo listo para deployar tu plataforma educativa con Docker!** 🚀

