#!/bin/bash

echo "========================================"
echo "   Plataforma Educativa - Editor de Codigo"
echo "========================================"
echo
echo "Iniciando todos los servicios..."
echo

# Función para ejecutar comandos en background
run_in_background() {
    local title=$1
    local command=$2
    echo "[$(date '+%H:%M:%S')] Iniciando $title..."
    gnome-terminal --title="$title" -- bash -c "$command; exec bash" 2>/dev/null || \
    xterm -title "$title" -e "bash -c '$command; exec bash'" 2>/dev/null || \
    echo "No se pudo abrir terminal para $title. Ejecuta manualmente: $command"
}

# Iniciar microservicio Flask
run_in_background "CodeExecutor" "cd CodeExecutor && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python src/app.py"

# Iniciar backend Node.js
run_in_background "Backend" "cd Backend && npm install && npm run dev"

# Iniciar frontend React
run_in_background "Frontend" "cd Frontend/frontend && npm install && npm run dev"

echo
echo "========================================"
echo "   Servicios iniciados correctamente"
echo "========================================"
echo
echo "- Microservicio Flask: http://localhost:5001"
echo "- Backend Node.js: http://localhost:5000"
echo "- Frontend React: http://localhost:5173"
echo
echo "Presiona Enter para continuar..."
read
