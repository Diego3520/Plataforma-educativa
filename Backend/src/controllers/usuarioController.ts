import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { usuarioService } from '../services/usuarioService';

const service = new usuarioService();

export class usuarioController {
    static async listar(req: Request, res: Response) {
        try {
            const usuarios = await service.listarUsuarios();
            return res.json(usuarios);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async verUno(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const usuario = await service.obtenerUsuarioPorId(id);
            return res.json(usuario);
        } catch (error: any) {
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async crear(req: Request, res: Response) {
        try {
            const errores = validationResult(req);
            if (!errores.isEmpty()) {
                return res.status(400).json({ errores: errores.array() });
            }
            // NO modifiques el payload aquí, solo pásalo al servicio
            const nuevo = await service.crearUsuario(req.body);
            return res.status(201).json(nuevo);
        } catch (error: any) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Valor único duplicado' });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async actualizar(req: Request, res: Response) {
        try {
            const errores = validationResult(req);
            if (!errores.isEmpty()) {
                return res.status(400).json({ errores: errores.array() });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const cambios = req.body;
            const actualizado = await service.editarUsuario(id, cambios);
            return res.json(actualizado);
        } catch (error: any) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            await service.borrarUsuario(id);
            return res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
}