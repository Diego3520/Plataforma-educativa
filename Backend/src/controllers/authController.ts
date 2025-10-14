import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuarioRepository';
import { usuarioService } from '../services/usuarioService';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import passport from 'passport';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const jwtSecret = process.env.JWT_SECRET || 'secret';

const googleClient = new OAuth2Client(googleClientId);
const service = new authService();


interface MicrosoftUser {
    id?: string;
    mail?: string;
    givenName?: string;
    surname?: string;
}

export class authController {
    static async login(req: Request, res: Response) {
        const { correo, password } = req.body;
        const repo = new usuarioRepository();
        const usuario = await repo.findByCorreo(correo);
        if (!usuario || !usuario.password_hash)
            return res.status(404).json({ error: 'Usuario no existe o no tiene contraseña' });

        const valid = await bcrypt.compare(password, usuario.password_hash);
        if (!valid)
            return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
        return res.json({ token, usuario });
    }

    static async google(req: Request, res: Response) {
        const { token } = req.body;
        try {
            const ticket = await googleClient.verifyIdToken({ idToken: token, audience: googleClientId });
            const payload = ticket.getPayload();
            if (!payload || !payload.email)
                return res.status(400).json({ error: 'Token inválido' });

            const repo = new usuarioRepository();
            let usuario = await repo.findByCorreo(payload.email);

            if (!usuario) {
                const service = new usuarioService();
                usuario = await service.crearUsuario({
                    nombre: payload.given_name || 'GoogleUser',
                    apellido: payload.family_name || '',
                    tipo: 'alumno',
                    correo: payload.email,
                    activo: true,
                    cod_sis: null,
                    google_id: payload.sub,
                    microsoft_id: null
                });
            }

            const jwtToken = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
            return res.json({ token: jwtToken, usuario });
        } catch (err) {
            return res.status(401).json({ error: 'Autenticación con Google fallida' });
        }
    }

    static async microsoft(req: Request, res: Response) {
        const { token } = req.body;
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json() as MicrosoftUser;
            if (!data || !data.mail)
                return res.status(400).json({ error: 'Token inválido' });

            const repo = new usuarioRepository();
            let usuario = await repo.findByCorreo(data.mail);

            if (!usuario) {
                const service = new usuarioService();
                usuario = await service.crearUsuario({
                    nombre: data.givenName || 'MicrosoftUser',
                    apellido: data.surname || '',
                    tipo: 'alumno',
                    correo: data.mail,
                    activo: true,
                    cod_sis: null,
                    google_id: null,
                    microsoft_id: data.id
                });
            }

            const jwtToken = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
            return res.json({ token: jwtToken, usuario });
        } catch (err) {
            return res.status(401).json({ error: 'Autenticación con Microsoft fallida' });
        }
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

