import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import passport from 'passport';

const service = new authService();

export class authController {
  static async registroManual(req: Request, res: Response) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const { nombre, apellido, correo, password, tipo } = req.body;
      const resultado = await service.registrarUsuarioManual({
        nombre,
        apellido,
        correo,
        password,
        tipo
      });

      if (!resultado.codigoEnviado) {
        return res.status(500).json({ 
          error: 'No se pudo enviar el código de verificación',
          usuario: resultado.usuario
        });
      }

      return res.status(201).json({
        mensaje: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.',
        usuario: resultado.usuario
      });
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verificarCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.body;
      
      if (!codigo) {
        return res.status(400).json({ error: 'Código requerido' });
      }

      const resultado = await service.verificarCodigo(codigo);
      
      if (!resultado.verificado) {
        return res.status(400).json({ error: 'Código inválido o expirado' });
      }

      return res.json({
        mensaje: 'Cuenta verificada correctamente',
        token: resultado.token,
        usuario: resultado.usuario
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async reenviarCodigo(req: Request, res: Response) {
    try {
      const { correo } = req.body;
      
      if (!correo) {
        return res.status(400).json({ error: 'Correo requerido' });
      }

      const enviado = await service.reenviarCodigo(correo);
      
      if (!enviado) {
        return res.status(400).json({ error: 'No se pudo reenviar el código' });
      }

      return res.json({
        mensaje: 'Código reenviado correctamente'
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      // El perfil de usuario ya está disponible en req.user gracias a passport
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Autenticación fallida' });
      }

      // Registrar o actualizar usuario
      const resultado = await service.registrarUsuarioOAuth({
        nombre: user.name.givenName,
        apellido: user.name.familyName,
        correo: user.emails[0].value,
        tipo: 'alumno', // Por defecto
        avatar_url: user.photos?.[0]?.value,
        proveedor: 'google'
      });

      // Redirigir al frontend con información en query params
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(user.emails[0].value)}`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async microsoftCallback(req: Request, res: Response) {
    try {
      // El perfil de usuario ya está disponible en req.user gracias a passport
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Autenticación fallida' });
      }

      // Registrar o actualizar usuario
      const resultado = await service.registrarUsuarioOAuth({
        nombre: user.name.givenName,
        apellido: user.name.familyName,
        correo: user.emails[0].value,
        tipo: 'alumno', // Por defecto
        avatar_url: user.photos?.[0]?.value,
        proveedor: 'microsoft'
      });

      // Redirigir al frontend con información en query params
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(user.emails[0].value)}`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}