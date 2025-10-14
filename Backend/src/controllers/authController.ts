import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuarioRepository';
import { usuarioService } from '../services/usuarioService';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const jwtSecret = process.env.JWT_SECRET || 'secret';

const googleClient = new OAuth2Client(googleClientId);

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
    }
}