import { Router } from 'express';
import { body, param } from 'express-validator';
import { inscritoController } from '../controllers/inscritoController';

const router = Router();

router.get('/', inscritoController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  inscritoController.verUno
);

router.get('/usuario/:usuarioId',
  param('usuarioId').isInt().withMessage('ID de usuario debe ser entero'),
  inscritoController.verPorUsuario
);

router.get('/topico/:topicoId',
  param('topicoId').isInt().withMessage('ID de topico debe ser entero'),
  inscritoController.verPorTopico
);

router.post('/',
  body('id_topico').isInt().withMessage('id_topico debe ser entero'),
  body('id_usuario').isInt().withMessage('id_usuario debe ser entero'),
  inscritoController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('id_topico').optional().isInt().withMessage('id_topico debe ser entero'),
  body('id_usuario').optional().isInt().withMessage('id_usuario debe ser entero'),
  inscritoController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  inscritoController.eliminar
);

export default router;
