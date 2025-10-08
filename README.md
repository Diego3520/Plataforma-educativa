# Plataforma Educativa - Editor de Código

Una plataforma educativa completa con un editor de código interactivo que permite ejecutar Python, JavaScript y TypeScript en tiempo real.

## 🏗️ Arquitectura

El proyecto está dividido en tres componentes principales:

1. **Microservicio Flask** (`CodeExecutor/`) - Ejecuta código de forma segura
2. **Backend Node.js** (`Backend/`) - API REST que integra con el microservicio
3. **Frontend React** (`Frontend/frontend/`) - Interfaz de usuario con editor de código

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Python 3.8+
- PostgreSQL (opcional, para el backend)

### 1. Microservicio Flask (CodeExecutor)

```bash
cd CodeExecutor

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\\Scripts\\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Ejecutar el microservicio
python src/app.py
```

El microservicio estará disponible en `http://localhost:5001`

### 2. Backend Node.js

```bash
cd Backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env basado en las variables existentes

# Ejecutar en modo desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Frontend React

```bash
cd Frontend/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con la URL del backend

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🔧 Configuración

### Variables de Entorno

#### CodeExecutor (.env)
```env
FLASK_APP=src/app.py
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5001
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_EXECUTION_TIME=30
MAX_MEMORY_MB=128
```

#### Backend (.env)
```env
# Variables existentes del backend
# Agregar:
CODE_EXECUTOR_URL=http://localhost:5001
CODE_EXECUTOR_TIMEOUT=35000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/code-executor
```

## 📚 Uso

### Flujo de Ejecución

1. **Usuario escribe código** en el editor React
2. **Frontend envía código** al backend Node.js
3. **Backend reenvía** la solicitud al microservicio Flask
4. **Microservicio ejecuta** el código de forma segura
5. **Resultado se devuelve** al frontend a través del backend

### Características del Editor

- ✅ **Múltiples lenguajes**: Python, JavaScript, TypeScript
- ✅ **Editor avanzado**: Basado en Monaco Editor (VS Code)
- ✅ **Ejecución segura**: Límites de tiempo y memoria
- ✅ **Interfaz moderna**: Modal responsive con temas
- ✅ **Atajos de teclado**: Ctrl+Enter para ejecutar
- ✅ **Monitoreo**: Tiempo de ejecución y uso de memoria
- ✅ **Autocompletado**: IntelliSense para todos los lenguajes

### API Endpoints

#### Backend (http://localhost:5000)
- `POST /api/code-executor/execute` - Ejecutar código
- `GET /api/code-executor/languages` - Lenguajes soportados
- `GET /api/code-executor/health` - Estado del microservicio

#### Microservicio (http://localhost:5001)
- `POST /execute` - Ejecutar código
- `GET /languages` - Lenguajes soportados
- `GET /health` - Estado del microservicio

## 🛡️ Seguridad

- **Ejecución aislada**: Cada ejecución se realiza en un proceso separado
- **Límites de recursos**: Tiempo máximo y memoria limitada
- **Validación de entrada**: Código y lenguaje validados antes de ejecutar
- **Limpieza automática**: Archivos temporales eliminados después de ejecutar
- **CORS configurado**: Solo orígenes permitidos pueden acceder

## 🧪 Testing

### Microservicio Flask
```bash
cd CodeExecutor
python -m pytest tests/
```

### Backend Node.js
```bash
cd Backend
npm test
```

### Frontend React
```bash
cd Frontend/frontend
npm test
```

## 📁 Estructura del Proyecto

```
Plataforma-educativa/
├── CodeExecutor/                 # Microservicio Flask
│   ├── src/
│   │   └── app.py               # Aplicación principal
│   ├── tests/
│   │   └── test_app.py          # Tests unitarios
│   ├── requirements.txt         # Dependencias Python
│   └── README.md               # Documentación del microservicio
├── Backend/                     # API Node.js
│   ├── src/
│   │   ├── controllers/
│   │   │   └── codeExecutorController.ts
│   │   ├── services/
│   │   │   └── codeExecutorService.ts
│   │   ├── routes/
│   │   │   └── codeExecutorRoutes.ts
│   │   └── server.ts
│   └── package.json
├── Frontend/frontend/           # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── CodeEditorModal.tsx
│   │   │   └── CodeEditorDemo.tsx
│   │   ├── services/
│   │   │   └── codeExecutorService.ts
│   │   ├── types/
│   │   │   └── codeExecutor.ts
│   │   └── App.tsx
│   └── package.json
└── README.md                    # Este archivo
```

## 🚀 Despliegue

### Desarrollo
1. Ejecutar los tres servicios en paralelo
2. Acceder a `http://localhost:5173` para usar la aplicación

### Producción
1. Configurar variables de entorno para producción
2. Construir el frontend: `npm run build`
3. Usar un servidor web para servir los archivos estáticos
4. Configurar proxy reverso para el backend y microservicio

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica que todos los servicios estén ejecutándose
3. Revisa los logs de cada servicio
4. Abre un issue en el repositorio

## 🔄 Actualizaciones Futuras

- [ ] Soporte para más lenguajes (Java, C++, Go, etc.)
- [ ] Ejecución en contenedores Docker
- [ ] Colaboración en tiempo real
- [ ] Historial de ejecuciones
- [ ] Integración con sistemas de autenticación
- [ ] Dashboard de métricas de uso
