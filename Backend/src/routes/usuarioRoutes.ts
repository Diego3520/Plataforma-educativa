import { Router } from 'express';
import { body, param } from 'express-validator';
import { usuarioController } from '../controllers/usuarioController';

const router = Router();

const tiposPermitidos = ['docente', 'alumno', 'evaluador', 'editor', 'admin'];

router.get('/', usuarioController.listar);

router.get('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  usuarioController.verUno
);

router.post('/',
  body('nombre').notEmpty().withMessage('nombre obligatorio'),
  body('apellido').notEmpty().withMessage('apellido obligatorio'),
  body('tipo').notEmpty().withMessage('tipo obligatorio').isIn(tiposPermitidos).withMessage('tipo inválido'),
  body('correo').optional().isEmail().withMessage('correo inválido'),
  body('password').notEmpty().withMessage('contraseña obligatoria'),
  body('avatar_url').optional().isURL().withMessage('avatar_url debe ser una URL válida'),
  usuarioController.crear
);

router.put('/:id',
  param('id').isInt().withMessage('ID debe ser entero'),
  body('tipo').optional().isIn(tiposPermitidos).withMessage('tipo inválido'),
  body('correo').optional().isEmail().withMessage('correo inválido'),
  body('password').optional(),
  body('avatar_url').optional().isURL().withMessage('avatar_url debe ser una URL válida'),
  usuarioController.actualizar
);

router.delete('/:id', 
  param('id').isInt().withMessage('ID debe ser entero'),
  usuarioController.eliminar
);

export default router;
