import { Router } from 'express';
import { body, param } from 'express-validator';
import { evaluacionController } from '../controllers/evaluacionController';

const router = Router();

router.get('/', evaluacionController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  evaluacionController.verUno
);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  evaluacionController.verPorTopico
);

router.post('/',
  body('fecha_publicacion').notEmpty().withMessage('fecha_publicacion obligatoria'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('fecha_limite').optional().isISO8601().withMessage('fecha_limite debe ser fecha valida'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('nota_max').optional().isNumeric().withMessage('nota_max debe ser numerico'),
  body('respuesta_id').optional().isInt().withMessage('respuesta_id debe ser entero'),
  evaluacionController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('fecha_publicacion').optional().notEmpty().withMessage('fecha_publicacion no puede estar vacia'),
  body('fecha_limite').optional().isISO8601().withMessage('fecha_limite debe ser fecha valida'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('nota_max').optional().isNumeric().withMessage('nota_max debe ser numerico'),
  body('respuesta_id').optional().isInt().withMessage('respuesta_id debe ser entero'),
  evaluacionController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  evaluacionController.eliminar
);

export default router;
