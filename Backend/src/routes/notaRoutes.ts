import { Router } from 'express';
import { body, param } from 'express-validator';
import { notaController } from '../controllers/notaController';

const router = Router();

router.get('/', notaController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  notaController.verUno
);

router.get('/inscrito/:inscritoId',
  param('inscritoId').isInt().withMessage('ID de inscrito debe ser entero'),
  notaController.verPorInscrito
);

router.get('/tarea/:tareaId',
  param('tareaId').isInt().withMessage('ID de tarea debe ser entero'),
  notaController.verPorTarea
);

router.get('/evaluacion/:evaluacionId',
  param('evaluacionId').isInt().withMessage('ID de evaluacion debe ser entero'),
  notaController.verPorEvaluacion
);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  notaController.verPorTopico
);

router.post('/',
  body('nota').isNumeric().withMessage('nota debe ser numerica'),
  body('tarea_id').optional().isInt().withMessage('tarea_id debe ser entero'),
  body('evaluacion_id').optional().isInt().withMessage('evaluacion_id debe ser entero'),
  body('inscrito_id').optional().isInt().withMessage('inscrito_id debe ser entero'),
  body('topico_id').optional().isInt().withMessage('topico_id debe ser entero'),
  body('comentario').optional().isString().withMessage('comentario debe ser texto'),
  notaController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('nota').optional().isNumeric().withMessage('nota debe ser numerica'),
  body('tarea_id').optional().isInt().withMessage('tarea_id debe ser entero'),
  body('evaluacion_id').optional().isInt().withMessage('evaluacion_id debe ser entero'),
  body('inscrito_id').optional().isInt().withMessage('inscrito_id debe ser entero'),
  body('topico_id').optional().isInt().withMessage('topico_id debe ser entero'),
  body('comentario').optional().isString().withMessage('comentario debe ser texto'),
  notaController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  notaController.eliminar
);

export default router;
