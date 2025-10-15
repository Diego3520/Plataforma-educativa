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
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no existe o no tiene contraseña' });
        }
        
        if (!usuario.password_hash) {
            return res.status(404).json({ error: 'Usuario no tiene contraseña configurada' });
        }

        const valid = await bcrypt.compare(password, usuario.password_hash);
        if (!valid)
            return res.status(401).json({ error: 'Credenciales inválidas' });

        // Verificar que el usuario esté activo
        if (!usuario.activo)
            return res.status(403).json({ error: 'Cuenta no verificada. Por favor, verifica tu correo electrónico.' });

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
        const usuarioSrv = new usuarioService();
        usuario = await usuarioSrv.crearUsuario({
          nombre: (payload.given_name as string) || (payload.name as string)?.split(' ')[0] || 'GoogleUser',
          apellido: (payload.family_name as string) || (payload.name as string)?.split(' ').slice(1).join(' ') || '',
          tipo: 'alumno',
          correo: payload.email,
                    google_id: payload.sub,
          avatar_url: (payload as any).picture || null,
          activo: true
        });
            } else if (!usuario.google_id) {
                // Update existing user with Google ID
                await repo.update(usuario.id_usuario, { google_id: payload.sub });
                usuario.google_id = payload.sub;
      }

      const jwtToken = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
      return res.json({ token: jwtToken, usuario });
        } catch (err) {
            console.error('Google auth error:', err);
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
      if (!data || !(data.mail || (data as any).userPrincipalName)) {
        return res.status(400).json({ error: 'Token inválido' });
      }

      const correo = data.mail || (data as any).userPrincipalName;
      const repo = new usuarioRepository();
      let usuario = await repo.findByCorreo(correo);

      if (!usuario) {
        const usuarioSrv = new usuarioService();
        usuario = await usuarioSrv.crearUsuario({
          nombre: data.givenName || 'MicrosoftUser',
          apellido: data.surname || '',
          tipo: 'alumno',
          correo,
                    microsoft_id: data.id,
          avatar_url: null,
          activo: true
        });
            } else if (!usuario.microsoft_id) {
                // Update existing user with Microsoft ID
                await repo.update(usuario.id_usuario, { microsoft_id: data.id });
                usuario.microsoft_id = data.id || null;
      }

      const jwtToken = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
      return res.json({ token: jwtToken, usuario });
        } catch (err) {
            console.error('Microsoft auth error:', err);
            return res.status(401).json({ error: 'Autenticación con Microsoft fallida' });
        }
  }
      static async registroManual(req: Request, res: Response) {
        try {
          console.log('Iniciando registro manual...');
          console.log('Datos recibidos:', req.body);
          
          const errores = validationResult(req);
          if (!errores.isEmpty()) {
            console.log('Errores de validación:', errores.array());
            return res.status(400).json({ errores: errores.array() });
          }

          const { nombre, apellido, correo, password, tipo } = req.body;
          console.log(`Registrando usuario: ${nombre} ${apellido} (${correo})`);
          
          const resultado = await service.registrarUsuarioManual({
            nombre,
            apellido,
            correo,
            password,
            tipo
          });

          console.log(' Resultado del envío de email:', resultado.codigoEnviado);

          if (!resultado.codigoEnviado) {
            console.error(' Error: No se pudo enviar el código de verificación');
            return res.status(500).json({
              error: 'No se pudo enviar el código de verificación. Verifica la configuración del email.',
              usuario: resultado.usuario
            });
          }

          console.log('Usuario registrado y código enviado exitosamente');
          return res.status(201).json({
            mensaje: `Usuario registrado exitosamente. Se ha enviado un código de verificación a ${correo}.`,
            usuario: resultado.usuario
          });
        } catch (error: any) {
          console.error('Error en registro manual:', error);
          if (error.code === '23505') {
            return res.status(409).json({ error: 'El correo ya está registrado' });
          }
          return res.status(500).json({ error: error.message });
        }
      }
  static async verificarCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.body;
      console.log('Verificando código:', codigo);
      
      if (!codigo) {
        return res.status(400).json({ error: 'Código requerido' });
      }

      const resultado = await service.verificarCodigo(codigo);
      
      if (!resultado.verificado) {
        console.log('Código inválido o expirado:', codigo);
        return res.status(400).json({ error: 'Código inválido o expirado. Intenta nuevamente.' });
      }

      console.log('Código verificado exitosamente para usuario:', resultado.usuario?.correo);
      return res.json({
        mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
        token: resultado.token,
        usuario: resultado.usuario
      });
    } catch (error: any) {
      console.error('Error en verificación de código:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async reenviarCodigo(req: Request, res: Response) {
    try {
      const { correo } = req.body;
      console.log('Reenviando código a:', correo);
      
      if (!correo) {
        return res.status(400).json({ error: 'Correo requerido' });
      }

      const enviado = await service.reenviarCodigo(correo);
      
      if (!enviado) {
        console.log('No se pudo reenviar el código a:', correo);
        return res.status(400).json({ error: 'No se pudo reenviar el código. Verifica que el correo esté registrado.' });
      }

      console.log('Código reenviado exitosamente a:', correo);
      return res.json({
        mensaje: `Código reenviado correctamente a ${correo}`
      });
    } catch (error: any) {
      console.error(' Error al reenviar código:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      // El perfil de usuario ya está disponible en req.user gracias a passport
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      const correo = user.emails[0].value;
      console.log(' Google callback - Email:', correo);
      
      const repo = new usuarioRepository();
      let usuario = await repo.findByCorreo(correo);

      if (!usuario) {
        console.log('Usuario no existe, creando nuevo usuario OAuth');
        const usuarioSrv = new usuarioService();
        usuario = await usuarioSrv.crearUsuario({
        nombre: user.name.givenName,
        apellido: user.name.familyName,
          tipo: 'alumno',
          correo,
          google_id: user.id,
        avatar_url: user.photos?.[0]?.value,
          activo: false // Usuario inactivo hasta verificación
        });
        
        // Generar código de verificación
        const service = new authService();
        const codigoEnviado = await service.generarYEnviarCodigo(usuario.id_usuario, correo);
        
        if (!codigoEnviado) {
          console.error('Error enviando código de verificación');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_failed`);
        }
        
        console.log('Usuario OAuth creado y código enviado');
        
        // Redirigir a página de verificación con el email
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(correo)}&provider=google&needs_verification=true`;
        return res.redirect(redirectUrl);
      } else if (!usuario.google_id) {
        console.log('Actualizando usuario existente con Google ID');
        await repo.update(usuario.id_usuario, { google_id: user.id });
        usuario.google_id = user.id;
      }

      // Si el usuario ya está activo, hacer login directamente
      if (usuario.activo) {
        console.log('Usuario ya activo, haciendo login directo');
        console.log('Datos del usuario:', {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          activo: usuario.activo
        });
        const token = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google&nombre=${encodeURIComponent(nombreCompleto)}`;
        console.log('URL de redirección:', redirectUrl);
        return res.redirect(redirectUrl);
      } else {
        // Usuario existe pero no está activo, necesita verificación
        console.log('Usuario existe pero no está activo, enviando código');
        const service = new authService();
        const codigoEnviado = await service.generarYEnviarCodigo(usuario.id_usuario, correo);
        
        if (!codigoEnviado) {
          console.error('Error enviando código de verificación');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_failed`);
        }
        
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(correo)}&provider=google&needs_verification=true`;
      return res.redirect(redirectUrl);
      }
    } catch (error: any) {
      console.error('Google callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }

  static async microsoftCallback(req: Request, res: Response) {
    try {
      // El perfil de usuario ya está disponible en req.user gracias a passport
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      const correo = user.emails?.[0]?.value || user._json?.mail;
      console.log(' Microsoft callback - Email:', correo);
      
      const repo = new usuarioRepository();
      let usuario = await repo.findByCorreo(correo);

      if (!usuario) {
        console.log('Usuario no existe, creando nuevo usuario OAuth');
        const usuarioSrv = new usuarioService();
        usuario = await usuarioSrv.crearUsuario({
          nombre: user.name?.givenName || user.displayName || 'MicrosoftUser',
          apellido: user.name?.familyName || '',
          tipo: 'alumno',
          correo,
          microsoft_id: user.id,
        avatar_url: user.photos?.[0]?.value,
          activo: false // Usuario inactivo hasta verificación
        });
        
        // Generar código de verificación
        const service = new authService();
        const codigoEnviado = await service.generarYEnviarCodigo(usuario.id_usuario, correo);
        
        if (!codigoEnviado) {
          console.error('Error enviando código de verificación');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_failed`);
        }
        
        console.log('Usuario OAuth creado y código enviado');
        
        // Redirigir a página de verificación con el email
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(correo)}&provider=microsoft&needs_verification=true`;
        return res.redirect(redirectUrl);
      } else if (!usuario.microsoft_id) {
        console.log('Actualizando usuario existente con Microsoft ID');
        await repo.update(usuario.id_usuario, { microsoft_id: user.id });
        usuario.microsoft_id = user.id;
      }

      // Si el usuario ya está activo, hacer login directamente
      if (usuario.activo) {
        console.log('Usuario ya activo, haciendo login directo');
        console.log('Datos del usuario:', {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          activo: usuario.activo
        });
        const token = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, jwtSecret, { expiresIn: '7d' });
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=microsoft&nombre=${encodeURIComponent(nombreCompleto)}`;
        console.log('URL de redirección:', redirectUrl);
        return res.redirect(redirectUrl);
      } else {
        // Usuario existe pero no está activo, necesita verificación
        console.log('Usuario existe pero no está activo, enviando código');
        const service = new authService();
        const codigoEnviado = await service.generarYEnviarCodigo(usuario.id_usuario, correo);
        
        if (!codigoEnviado) {
          console.error('Error enviando código de verificación');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_failed`);
        }
        
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?email=${encodeURIComponent(correo)}&provider=microsoft&needs_verification=true`;
      return res.redirect(redirectUrl);
      }
    } catch (error: any) {
      console.error('Microsoft callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
 }

