import { Router } from 'express';
import { body, param } from 'express-validator';
import { respuestaController } from '../controllers/respuestaController';

const router = Router();

router.get('/', respuestaController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  respuestaController.verUno
);

router.get('/pregunta/:numPregunta',
  param('numPregunta').isInt().withMessage('Numero de pregunta debe ser entero'),
  respuestaController.verPorPregunta
);

router.post('/',
  body('num_pregunta').isInt().withMessage('num_pregunta debe ser entero'),
  body('pregunta_descripcion').optional().isString().withMessage('pregunta_descripcion debe ser texto'),
  body('respuesta_dada').optional().isString().withMessage('respuesta_dada debe ser texto'),
  respuestaController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('num_pregunta').optional().isInt().withMessage('num_pregunta debe ser entero'),
  body('pregunta_descripcion').optional().isString().withMessage('pregunta_descripcion debe ser texto'),
  body('respuesta_dada').optional().isString().withMessage('respuesta_dada debe ser texto'),
  respuestaController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  respuestaController.eliminar
);

export default router;
