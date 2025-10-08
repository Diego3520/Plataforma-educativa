import { Router } from 'express';
import { body, param } from 'express-validator';
import { tareaController } from '../controllers/tareaController';

const router = Router();

router.get('/', tareaController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  tareaController.verUno
);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  tareaController.verPorTopico
);

router.post('/',
  body('fecha_publicacion').notEmpty().withMessage('fecha_publicacion obligatoria'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('fecha_limite').optional().isISO8601().withMessage('fecha_limite debe ser fecha valida'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('nota_max').optional().isNumeric().withMessage('nota_max debe ser numerico'),
  body('solucion_aportada').optional().isString().withMessage('solucion_aportada debe ser texto'),
  tareaController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('fecha_publicacion').optional().notEmpty().withMessage('fecha_publicacion no puede estar vacia'),
  body('fecha_limite').optional().isISO8601().withMessage('fecha_limite debe ser fecha valida'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('nota_max').optional().isNumeric().withMessage('nota_max debe ser numerico'),
  body('solucion_aportada').optional().isString().withMessage('solucion_aportada debe ser texto'),
  tareaController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  tareaController.eliminar
);

export default router;
