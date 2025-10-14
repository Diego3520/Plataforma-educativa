import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import passport from 'passport';

const router = Router();

const tiposPermitidos = ['docente', 'alumno', 'evaluador', 'editor', 'admin'];

// Registro manual
router.post('/registro', 
  body('nombre').notEmpty().withMessage('nombre obligatorio'),
  body('apellido').notEmpty().withMessage('apellido obligatorio'),
  body('correo').isEmail().withMessage('correo inválido'),
  body('password').isLength({ min: 6 }).withMessage('contraseña debe tener al menos 6 caracteres'),
  body('tipo').isIn(tiposPermitidos).withMessage('tipo inválido'),
  authController.registroManual
);

// Verificar código
router.post('/verificar',
  body('codigo').notEmpty().withMessage('código obligatorio'),
  authController.verificarCodigo
);

// Reenviar código
router.post('/reenviar',
  body('correo').isEmail().withMessage('correo inválido'),
  authController.reenviarCodigo
);

// Rutas OAuth Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);

// Rutas OAuth Microsoft
router.get('/microsoft', (req, res, next) => {
  console.log('Iniciando autenticación Microsoft...');
  next();
}, passport.authenticate('microsoft'));

router.get('/microsoft/callback', (req, res, next) => {
  console.log('Recibiendo callback de Microsoft en:', req.url);
  console.log('Query params:', req.query);
  next();
}, passport.authenticate('microsoft', { failureRedirect: '/login' }),
   authController.microsoftCallback
);

export default router;