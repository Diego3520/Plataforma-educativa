import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { inscritoService } from '../services/inscritoService';

const service = new inscritoService();

export class inscritoController {
  static async listar(req: Request, res: Response) {
    try {
      const inscritos = await service.listarInscritos();
      return res.json(inscritos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verUno(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID invalido' });
      }
      const inscrito = await service.obtenerInscritoPorId(id);
      return res.json(inscrito);
    } catch (error: any) {
      if (error.message === 'Inscrito no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorUsuario(req: Request, res: Response) {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      if (isNaN(usuarioId)) {
        return res.status(400).json({ error: 'ID de usuario invalido' });
      }
      const inscritos = await service.obtenerInscritosPorUsuarioId(usuarioId);
      return res.json(inscritos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorTopico(req: Request, res: Response) {
    try {
      const topicoId = parseInt(req.params.topicoId);
      if (isNaN(topicoId)) {
        return res.status(400).json({ error: 'ID de topico invalido' });
      }
      const inscritos = await service.obtenerInscritosPorTopicoId(topicoId);
      return res.json(inscritos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }
      const payload = req.body;
      const nuevo = await service.crearInscrito(payload);
      return res.status(201).json(nuevo);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Valor unico duplicado' });
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
        return res.status(400).json({ error: 'ID invalido' });
      }
      const cambios = req.body;
      const actualizado = await service.editarInscrito(id, cambios);
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
        return res.status(400).json({ error: 'ID invalido' });
      }
      await service.borrarInscrito(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
