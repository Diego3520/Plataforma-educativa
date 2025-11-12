import { Router } from 'express';
import { body, param } from 'express-validator';
import { comentarioEditorController } from '../controllers/comentarioEditorController';

const router = Router();

router.get('/', comentarioEditorController.listar);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  comentarioEditorController.verPorTopico
);

router.get('/editor/:editorId',
  param('editorId').isInt().withMessage('ID de editor debe ser entero'),
  comentarioEditorController.verPorEditor
);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  comentarioEditorController.verUno
);

router.post('/',
  body('id_topico').isInt().withMessage('id_topico debe ser entero'),
  body('id_editor').isInt().withMessage('id_editor debe ser entero'),
  body('contenido').notEmpty().withMessage('contenido es requerido').isString().withMessage('contenido debe ser texto'),
  body('tipo').isIn(['comentario', 'contenido', 'material']).withMessage('tipo debe ser comentario, contenido o material'),
  body('material_id').optional({ nullable: true }).isInt().withMessage('material_id debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  comentarioEditorController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('contenido').optional().notEmpty().withMessage('contenido no puede estar vacio').isString().withMessage('contenido debe ser texto'),
  body('tipo').optional().isIn(['comentario', 'contenido', 'material']).withMessage('tipo debe ser comentario, contenido o material'),
  body('material_id').optional({ nullable: true }).isInt().withMessage('material_id debe ser entero'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  comentarioEditorController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  comentarioEditorController.eliminar
);

export default router;

