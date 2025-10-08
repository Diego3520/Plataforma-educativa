@echo off
echo ========================================
echo    Plataforma Educativa - Editor de Codigo
echo ========================================
echo.
echo Iniciando todos los servicios...
echo.

echo [1/3] Iniciando Microservicio Flask (CodeExecutor)...
start "CodeExecutor" cmd /k "cd CodeExecutor && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python src/app.py"

echo [2/3] Iniciando Backend Node.js...
start "Backend" cmd /k "cd Backend && npm install && npm run dev"

echo [3/3] Iniciando Frontend React...
start "Frontend" cmd /k "cd Frontend\frontend && npm install && npm run dev"

echo.
echo ========================================
echo    Servicios iniciados correctamente
echo ========================================
echo.
echo - Microservicio Flask: http://localhost:5001
echo - Backend Node.js: http://localhost:5000
echo - Frontend React: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
