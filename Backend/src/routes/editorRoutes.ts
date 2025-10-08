import { Router } from 'express';
import { body, param } from 'express-validator';
import { editorController } from '../controllers/editorController';

const router = Router();

router.get('/', editorController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  editorController.verUno
);

router.get('/docente/:docenteId',
  param('docenteId').isInt().withMessage('ID de docente debe ser entero'),
  editorController.verPorDocente
);

router.post('/',
  body('id_docente').isInt().withMessage('id_docente debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  editorController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_docente').optional().isInt().withMessage('id_docente debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  editorController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  editorController.eliminar
);

export default router;
