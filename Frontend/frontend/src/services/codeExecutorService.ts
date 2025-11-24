import axios from 'axios';
import type {
  CodeExecutionRequest,
  CodeExecutionResponse,
  SupportedLanguages,
  HealthCheckResponse,
} from '../types/codeExecutor';

class CodeExecutorService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app/api/code-executor';
  }

  /**
   * Ejecuta código enviándolo al backend
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response = await axios.post<CodeExecutionResponse>(
        `${this.baseUrl}/execute`,
        request,
        {
          timeout: 35000, // 35 segundos
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al ejecutar código:', error);
      
      // Si es un error de timeout
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          output: '',
          error: 'Tiempo de espera agotado. El código tardó demasiado en ejecutarse.',
          execution_time: 0,
          memory_used: 0,
        };
      }

      // Si es un error de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          output: '',
          error: 'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.',
          execution_time: 0,
          memory_used: 0,
        };
      }

      // Si hay una respuesta del servidor con error
      if (error.response?.data) {
        return error.response.data;
      }

      // Otros errores
      return {
        success: false,
        output: '',
        error: `Error de conexión: ${error.message}`,
        execution_time: 0,
        memory_used: 0,
      };
    }
  }

  /**
   * Obtiene los lenguajes soportados
   */
  async getSupportedLanguages(): Promise<SupportedLanguages> {
    try {
      const response = await axios.get<{ languages: SupportedLanguages }>(
        `${this.baseUrl}/languages`,
        { timeout: 5000 }
      );

      return response.data.languages;
    } catch (error: any) {
      console.error('Error al obtener lenguajes soportados:', error);
      
      // Retornar lenguajes por defecto si no se puede conectar
      return {
        python: {
          extension: '.py',
          command: 'python',
          timeout: 30,
        },
        javascript: {
          extension: '.js',
          command: 'node',
          timeout: 30,
        },
        typescript: {
          extension: '.ts',
          command: 'ts-node',
          timeout: 30,
        },
      };
    }
  }

  /**
   * Verifica el estado del microservicio
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await axios.get<HealthCheckResponse>(
        `${this.baseUrl}/health`,
        { timeout: 5000 }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en health check:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        supported_languages: [],
      };
    }
  }
}

export const codeExecutorService = new CodeExecutorService();
