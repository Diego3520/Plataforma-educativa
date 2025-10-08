import { Router } from 'express';
import { body, param } from 'express-validator';
import { materialController } from '../controllers/materialController';

const router = Router();

router.get('/', materialController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  materialController.verUno
);

router.get('/tipo/:contentType',
  param('contentType').isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('Tipo de contenido invalido'),
  materialController.verPorTipo
);

router.post('/',
  body('content_type').isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('content_type invalido'),
  body('solucion_modelo').optional().isString().withMessage('solucion_modelo debe ser texto'),
  body('ruta_archivo').optional().isString().withMessage('ruta_archivo debe ser texto'),
  body('tamano_bytes').optional().isInt().withMessage('tamano_bytes debe ser entero'),
  body('mime_type').optional().isString().withMessage('mime_type debe ser texto'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  materialController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('content_type').optional().isIn(['pdf', 'video', 'imagen', 'otro']).withMessage('content_type invalido'),
  body('solucion_modelo').optional().isString().withMessage('solucion_modelo debe ser texto'),
  body('ruta_archivo').optional().isString().withMessage('ruta_archivo debe ser texto'),
  body('tamano_bytes').optional().isInt().withMessage('tamano_bytes debe ser entero'),
  body('mime_type').optional().isString().withMessage('mime_type debe ser texto'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano'),
  materialController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  materialController.eliminar
);

export default router;
