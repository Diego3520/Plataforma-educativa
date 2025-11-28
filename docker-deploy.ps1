# Script de deployment para Windows
# Ejecutar con: .\docker-deploy.ps1

Write-Host "🚀 Iniciando deployment de Plataforma Educativa..." -ForegroundColor Cyan

# Verificar si Docker está instalado
Write-Host "`nVerificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está instalado o no está en PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker Compose está disponible
Write-Host "`nVerificando Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker Compose no está disponible" -ForegroundColor Red
    exit 1
}

# Verificar si existe el archivo .env
Write-Host "`nVerificando configuración..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    if (Test-Path ".env.docker.example") {
        Write-Host "Creando .env desde .env.docker.example..." -ForegroundColor Cyan
        Copy-Item ".env.docker.example" ".env"
        Write-Host "✅ Archivo .env creado. Por favor edita el archivo con tus valores reales antes de continuar." -ForegroundColor Green
        Write-Host "`n¿Deseas continuar con los valores por defecto? (S/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne "S" -and $response -ne "s") {
            Write-Host "Deployment cancelado. Configura el archivo .env y vuelve a ejecutar el script." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "❌ No se encontró .env.docker.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Verificar puertos disponibles
Write-Host "`nVerificando puertos..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "⚠️  Puerto 5000 está en uso" -ForegroundColor Yellow
    Write-Host "¿Deseas detener el proceso que usa el puerto? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        $pid = $port5000[0].OwningProcess
        Stop-Process -Id $pid -Force
        Write-Host "✅ Proceso detenido" -ForegroundColor Green
    }
}

if ($port5173) {
    Write-Host "⚠️  Puerto 5173 está en uso" -ForegroundColor Yellow
    Write-Host "¿Deseas detener el proceso que usa el puerto? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        $pid = $port5173[0].OwningProcess
        Stop-Process -Id $pid -Force
        Write-Host "✅ Proceso detenido" -ForegroundColor Green
    }
}

# Crear directorio de uploads si no existe
Write-Host "`nCreando directorios necesarios..." -ForegroundColor Yellow
if (!(Test-Path "Backend\uploads")) {
    New-Item -ItemType Directory -Path "Backend\uploads" -Force | Out-Null
    Write-Host "✅ Directorio Backend\uploads creado" -ForegroundColor Green
}

# Menú de opciones
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Selecciona una opción:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Build y Deploy (primera vez o con cambios)"
Write-Host "2. Deploy rápido (sin rebuild)"
Write-Host "3. Detener servicios"
Write-Host "4. Ver logs"
Write-Host "5. Limpiar todo (contenedores + volúmenes)"
Write-Host "6. Salir"
Write-Host "==================================" -ForegroundColor Cyan
$option = Read-Host "Opción"

switch ($option) {
    "1" {
        Write-Host "`n🏗️  Construyendo y desplegando..." -ForegroundColor Cyan
        docker-compose up --build -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Deployment completado exitosamente!" -ForegroundColor Green
            Write-Host "`n📍 URLs disponibles:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
            Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
            Write-Host "`n📊 Ver logs: docker-compose logs -f" -ForegroundColor Yellow
        } else {
            Write-Host "`n❌ Error durante el deployment" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "`n🚀 Desplegando..." -ForegroundColor Cyan
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Servicios iniciados!" -ForegroundColor Green
            Write-Host "`n📍 URLs disponibles:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
            Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
        } else {
            Write-Host "`n❌ Error al iniciar servicios" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`n🛑 Deteniendo servicios..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
    "4" {
        Write-Host "`n📊 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
        docker-compose logs -f
    }
    "5" {
        Write-Host "`n⚠️  ¿Estás seguro? Esto eliminará contenedores, redes y volúmenes (S/N)" -ForegroundColor Red
        $confirm = Read-Host
        if ($confirm -eq "S" -or $confirm -eq "s") {
            Write-Host "🧹 Limpiando..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✅ Limpieza completada" -ForegroundColor Green
        }
    }
    "6" {
        Write-Host "`nSaliendo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "`n❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host "`n✨ Script completado" -ForegroundColor Green

