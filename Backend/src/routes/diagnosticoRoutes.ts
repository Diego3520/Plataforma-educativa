import { Router } from 'express';
import { body, param } from 'express-validator';
import { diagnosticoController } from '../controllers/diagnosticoController';

const router = Router();

router.get('/', diagnosticoController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  diagnosticoController.verUno
);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  diagnosticoController.verPorTopico
);

router.get('/diagnosticador/:diagnosticadorId',
  param('diagnosticadorId').isInt().withMessage('ID de diagnosticador debe ser entero'),
  diagnosticoController.verPorDiagnosticador
);

router.post('/',
  body('id_topico').isInt().withMessage('id_topico debe ser entero'),
  body('id_diagnosticador').isInt().withMessage('id_diagnosticador debe ser entero'),
  body('nota_diagn').optional().isNumeric().withMessage('nota_diagn debe ser numerica'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  diagnosticoController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('id_diagnosticador').optional().isInt().withMessage('id_diagnosticador debe ser entero'),
  body('nota_diagn').optional().isNumeric().withMessage('nota_diagn debe ser numerica'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  diagnosticoController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  diagnosticoController.eliminar
);

export default router;
