import { Router } from 'express';
import { CodeExecutorController } from '../controllers/codeExecutorController';

const router = Router();
const codeExecutorController = new CodeExecutorController();

/**
 * @route POST /api/code-executor/execute
 * @desc Ejecuta código enviándolo al microservicio Flask
 * @access Public (en producción debería ser privado)
 */
router.post('/execute', (req, res) => {
  codeExecutorController.executeCode(req, res);
});

/**
 * @route GET /api/code-executor/languages
 * @desc Obtiene los lenguajes soportados por el microservicio
 * @access Public
 */
router.get('/languages', (req, res) => {
  codeExecutorController.getSupportedLanguages(req, res);
});

/**
 * @route GET /api/code-executor/health
 * @desc Verifica el estado del microservicio de ejecución de código
 * @access Public
 */
router.get('/health', (req, res) => {
  codeExecutorController.healthCheck(req, res);
});

export default router;
