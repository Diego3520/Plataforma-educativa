import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { tareaService } from '../services/tareaService';

const service = new tareaService();

export class tareaController {
  static async listar(req: Request, res: Response) {
    try {
      const tareas = await service.listarTareas();
      return res.json(tareas);
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
      const tarea = await service.obtenerTareaPorId(id);
      return res.json(tarea);
    } catch (error: any) {
      if (error.message === 'Tarea no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorTopico(req: Request, res: Response) {
    try {
      const topicoId = parseInt(req.params.topicoId);
      if (isNaN(topicoId)) {
        return res.status(400).json({ error: 'ID de topico invalido' });
      }
      const tareas = await service.obtenerTareasPorTopicoId(topicoId);
      return res.json(tareas);
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
      const nuevo = await service.crearTarea(payload);
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
      const actualizado = await service.editarTarea(id, cambios);
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
      await service.borrarTarea(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
