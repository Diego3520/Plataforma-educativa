from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import subprocess
import psutil
import signal
import time
from datetime import datetime
import json

app = Flask(__name__)

# Configuración CORS
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(','))

# Configuración de límites
MAX_EXECUTION_TIME = int(os.getenv('MAX_EXECUTION_TIME', '30'))
MAX_MEMORY_MB = int(os.getenv('MAX_MEMORY_MB', '128'))

class CodeExecutor:
    def __init__(self):
        self.supported_languages = {
            'python': {
                'extension': '.py',
                'command': 'python',
                'timeout': MAX_EXECUTION_TIME
            }
        }
    
    def execute_code(self, code: str, language: str = 'python') -> dict:
        """
        Ejecuta código Python de forma segura y retorna el resultado
        """
        # Solo soportamos Python
        if language != 'python':
            return {
                'success': False,
                'output': '',
                'error': f'Solo se soporta Python. Recibido: {language}',
                'execution_time': 0,
                'memory_used': 0
            }
        
        config = self.supported_languages['python']
        
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix=config['extension'],
            delete=False,
            encoding='utf-8'
        ) as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name
        
        try:
            # Ejecutar código con límites de tiempo y memoria
            start_time = time.time()
            
            process = subprocess.Popen(
                [config['command'], temp_file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid if os.name != 'nt' else None
            )
            
            # Monitorear el proceso
            try:
                stdout, stderr = process.communicate(timeout=config['timeout'])
                execution_time = time.time() - start_time
                
                # Obtener uso de memoria
                memory_used = 0
                try:
                    process_info = psutil.Process(process.pid)
                    memory_used = process_info.memory_info().rss / 1024 / 1024  # MB
                except:
                    pass
                
                return {
                    'success': process.returncode == 0,
                    'output': stdout,
                    'error': stderr,
                    'execution_time': round(execution_time, 3),
                    'memory_used': round(memory_used, 2)
                }
                
            except subprocess.TimeoutExpired:
                # Terminar proceso si excede el tiempo límite
                if os.name != 'nt':
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                else:
                    process.terminate()
                
                return {
                    'success': False,
                    'output': '',
                    'error': f'Tiempo de ejecución excedido ({config["timeout"]}s)',
                    'execution_time': config['timeout'],
                    'memory_used': 0
                }
                
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': f'Error interno: {str(e)}',
                'execution_time': 0,
                'memory_used': 0
            }
        
        finally:
            # Limpiar archivo temporal
            try:
                os.unlink(temp_file_path)
            except:
                pass

# Instancia global del ejecutor
executor = CodeExecutor()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del microservicio"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'supported_languages': list(executor.supported_languages.keys())
    })

@app.route('/execute', methods=['POST'])
def execute_code():
    """
    Endpoint principal para ejecutar código
    Body esperado:
    {
        "code": "print('Hello World/x=5/print(x)')",
        "language": "python"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó JSON en el cuerpo de la petición'
            }), 400
        
        code = data.get('code', '')
        language = 'python'  # Solo Python
        
        if not code.strip():
            return jsonify({
                'success': False,
                'error': 'El código no puede estar vacío'
            }), 400
        
        # Ejecutar código Python
        result = executor.execute_code(code, 'python')
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error del servidor: {str(e)}'
        }), 500

@app.route('/languages', methods=['GET'])
def get_supported_languages():
    """Obtiene los lenguajes soportados"""
    return jsonify({
        'languages': executor.supported_languages
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"Iniciando microservicio CodeExecutor en puerto {port}")
    print(f"Solo soporta Python")
    print(f"Modo debug: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
