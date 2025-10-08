import { Request, Response } from 'express';
import { CodeExecutorService, CodeExecutionRequest } from '../services/codeExecutorService';

export class CodeExecutorController {
  private codeExecutorService: CodeExecutorService;

  constructor() {
    this.codeExecutorService = new CodeExecutorService();
  }

  /**
   * Ejecuta código enviándolo al microservicio Flask
   */
  async executeCode(req: Request, res: Response): Promise<void> {
    try {
      const { code }: CodeExecutionRequest = req.body;
      const language = 'python'; // Solo Python

      // Validar entrada
      const validation = this.codeExecutorService.validateCode(code, language);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.error,
        });
        return;
      }

      // Ejecutar código Python
      const result = await this.codeExecutorService.executeCode({ code, language: 'python' });

      res.json(result);
    } catch (error: any) {
      console.error('Error en executeCode:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        output: '',
        execution_time: 0,
        memory_used: 0,
      });
    }
  }

  /**
   * Obtiene los lenguajes soportados
   */
  async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await this.codeExecutorService.getSupportedLanguages();
      res.json({ languages });
    } catch (error: any) {
      console.error('Error en getSupportedLanguages:', error);
      res.status(500).json({
        error: 'Error al obtener lenguajes soportados',
      });
    }
  }

  /**
   * Verifica el estado del microservicio
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.codeExecutorService.healthCheck();
      res.json(health);
    } catch (error: any) {
      console.error('Error en healthCheck:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        supported_languages: [],
        error: 'Error al verificar el estado del microservicio',
      });
    }
  }
}
