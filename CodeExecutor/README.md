
## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
```

2. Activar entorno virtual:
```bash
venv\\Scripts\\activate

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

## Uso

### Iniciar el servidor:
```bash
python src/app.py
```

El servidor estará disponible en `http://localhost:5001`

### Endpoints disponibles:

- `GET /health` - Estado del microservicio
- `POST /execute` - Ejecutar código
- `GET /languages` - Lenguajes soportados

```

