import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { notaService } from '../services/notaService';

const service = new notaService();

export class notaController {
  static async listar(req: Request, res: Response) {
    try {
      const notas = await service.listarNotas();
      return res.json(notas);
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
      const nota = await service.obtenerNotaPorId(id);
      return res.json(nota);
    } catch (error: any) {
      if (error.message === 'Nota no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorInscrito(req: Request, res: Response) {
    try {
      const inscritoId = parseInt(req.params.inscritoId);
      if (isNaN(inscritoId)) {
        return res.status(400).json({ error: 'ID de inscrito invalido' });
      }
      const notas = await service.obtenerNotasPorInscritoId(inscritoId);
      return res.json(notas);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorTarea(req: Request, res: Response) {
    try {
      const tareaId = parseInt(req.params.tareaId);
      if (isNaN(tareaId)) {
        return res.status(400).json({ error: 'ID de tarea invalido' });
      }
      const notas = await service.obtenerNotasPorTareaId(tareaId);
      return res.json(notas);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorEvaluacion(req: Request, res: Response) {
    try {
      const evaluacionId = parseInt(req.params.evaluacionId);
      if (isNaN(evaluacionId)) {
        return res.status(400).json({ error: 'ID de evaluacion invalido' });
      }
      const notas = await service.obtenerNotasPorEvaluacionId(evaluacionId);
      return res.json(notas);
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
      const notas = await service.obtenerNotasPorTopicoId(topicoId);
      return res.json(notas);
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
      const nuevo = await service.crearNota(payload);
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
      const actualizado = await service.editarNota(id, cambios);
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
      await service.borrarNota(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
