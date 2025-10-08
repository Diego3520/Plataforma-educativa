import { Router } from 'express';
import { body, param } from 'express-validator';
import { topicoController } from '../controllers/topicoController';

const router = Router();

router.get('/', topicoController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  topicoController.verUno
);

router.get('/curso/:cursoId',
  param('cursoId').isInt().withMessage('ID de curso debe ser entero'),
  topicoController.verPorCurso
);

router.post('/',
  body('id_curso').isInt().withMessage('id_curso debe ser entero'),
  body('orden').isInt().withMessage('orden debe ser entero'),
  body('titulo').optional().isString().withMessage('titulo debe ser texto'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  topicoController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_curso').optional().isInt().withMessage('id_curso debe ser entero'),
  body('orden').optional().isInt().withMessage('orden debe ser entero'),
  body('titulo').optional().isString().withMessage('titulo debe ser texto'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  body('material_id').optional().isInt().withMessage('material_id debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  topicoController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  topicoController.eliminar
);

export default router;
