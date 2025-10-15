import { Router } from 'express';
import { body, param } from 'express-validator';
import { cursoController } from '../controllers/cursoController';

const router = Router();

router.get('/', cursoController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  cursoController.verUno
);

router.get('/docente/:docenteId',
  param('docenteId').isInt().withMessage('ID de docente debe ser entero'),
  cursoController.verPorDocente
);

router.get('/editor/:editorId',
  param('editorId').isInt().withMessage('ID de editor debe ser entero'),
  cursoController.verPorEditor
);

router.get('/evaluador/:evaluadorId',
  param('evaluadorId').isInt().withMessage('ID de evaluador debe ser entero'),
  cursoController.verPorEvaluador
);

router.post('/',
  body('codigo').notEmpty().withMessage('codigo obligatorio'),
  body('editor_id').optional().isInt().withMessage('editor_id debe ser entero'),
  body('docente_id').optional().isInt().withMessage('docente_id debe ser entero'),
  body('evaluador_id').optional().isInt().withMessage('evaluador_id debe ser entero'),
  body('titulo').optional().isString().withMessage('titulo debe ser texto'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  cursoController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('codigo').optional().notEmpty().withMessage('codigo no puede estar vacio'),
  body('editor_id').optional().isInt().withMessage('editor_id debe ser entero'),
  body('docente_id').optional().isInt().withMessage('docente_id debe ser entero'),
  body('evaluador_id').optional().isInt().withMessage('evaluador_id debe ser entero'),
  body('titulo').optional().isString().withMessage('titulo debe ser texto'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser texto'),
  cursoController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  cursoController.eliminar
);

export default router;
