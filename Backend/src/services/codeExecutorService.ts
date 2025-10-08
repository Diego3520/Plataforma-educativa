import axios, { AxiosResponse } from 'axios';

export interface CodeExecutionRequest {
  code: string;
  language: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  output: string;
  error: string;
  execution_time: number;
  memory_used: number;
}

export interface SupportedLanguages {
  [key: string]: {
    extension: string;
    command: string;
    timeout: number;
  };
}

export class CodeExecutorService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = process.env.CODE_EXECUTOR_URL || 'http://localhost:5001';
    this.timeout = parseInt(process.env.CODE_EXECUTOR_TIMEOUT || '35000'); // 35 segundos
  }

  /**
   * Ejecuta código enviándolo al microservicio Flask
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response: AxiosResponse<CodeExecutionResponse> = await axios.post(
        `${this.baseUrl}/execute`,
        request,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al ejecutar código:', error.message);
      
      // Si es un error de timeout
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          output: '',
          error: 'Tiempo de espera agotado al comunicarse con el ejecutor de código',
          execution_time: 0,
          memory_used: 0,
        };
      }

      // Si es un error de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          output: '',
          error: 'No se pudo conectar con el ejecutor de código. Verifique que el microservicio esté ejecutándose.',
          execution_time: 0,
          memory_used: 0,
        };
      }

      // Otros errores
      return {
        success: false,
        output: '',
        error: `Error del servidor: ${error.message}`,
        execution_time: 0,
        memory_used: 0,
      };
    }
  }

  /**
   * Obtiene los lenguajes soportados por el microservicio
   */
  async getSupportedLanguages(): Promise<SupportedLanguages> {
    try {
      const response: AxiosResponse<{ languages: SupportedLanguages }> = await axios.get(
        `${this.baseUrl}/languages`,
        { timeout: 5000 }
      );

      return response.data.languages;
    } catch (error: any) {
      console.error('Error al obtener lenguajes soportados:', error.message);
      
      // Retornar solo Python si no se puede conectar
      return {
        python: {
          extension: '.py',
          command: 'python',
          timeout: 30,
        },
      };
    }
  }

  /**
   * Verifica el estado del microservicio
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; supported_languages: string[] }> {
    try {
      const response: AxiosResponse<{ status: string; timestamp: string; supported_languages: string[] }> = await axios.get(
        `${this.baseUrl}/health`,
        { timeout: 5000 }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en health check:', error.message);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        supported_languages: [],
      };
    }
  }

  /**
   * Valida el código Python antes de enviarlo al microservicio
   */
  validateCode(code: string, language: string): { isValid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        error: 'El código no puede estar vacío',
      };
    }

    if (code.length > 10000) {
      return {
        isValid: false,
        error: 'El código excede el límite de 10,000 caracteres',
      };
    }

    // Solo soportamos Python
    if (language.toLowerCase() !== 'python') {
      return {
        isValid: false,
        error: 'Solo se soporta Python',
      };
    }

    return { isValid: true };
  }
}
