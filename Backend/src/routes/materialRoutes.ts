import { Router } from 'express';
import { body, param } from 'express-validator';
import { materialController } from '../controllers/materialController';

const router = Router();

router.get('/', materialController.listar);

router.get('/curso/:id_curso',
  param('id_curso').isInt().withMessage('ID de curso debe ser entero'),
  materialController.verPorCurso
);

router.get('/tipo/:contentType',
  param('contentType').isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('Tipo de contenido invalido'),
  materialController.verPorTipo
);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  materialController.verUno
);

router.post('/',
  body('id_curso').isInt().withMessage('id_curso es requerido y debe ser entero'),
  body('content_type').isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('content_type invalido'),
  body('ruta_archivo').notEmpty().withMessage('ruta_archivo es requerido').isString().withMessage('ruta_archivo debe ser texto'),
  body('solucion_modelo').optional({ nullable: true }).isString().withMessage('solucion_modelo debe ser texto'),
  body('tamano_bytes').optional({ nullable: true }).isInt().withMessage('tamano_bytes debe ser entero'),
  body('mime_type').optional({ nullable: true }).isString().withMessage('mime_type debe ser texto'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  materialController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('content_type').optional().isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('content_type invalido'),
  body('solucion_modelo').optional({ nullable: true }).isString().withMessage('solucion_modelo debe ser texto'),
  body('ruta_archivo').optional().isString().withMessage('ruta_archivo debe ser texto'),
  body('tamano_bytes').optional({ nullable: true }).isInt().withMessage('tamano_bytes debe ser entero'),
  body('mime_type').optional({ nullable: true }).isString().withMessage('mime_type debe ser texto'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  materialController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  materialController.eliminar
);

export default router;