import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { comentarioEditorService } from '../services/comentarioEditorService';

const service = new comentarioEditorService();

export class comentarioEditorController {
  static async listar(req: Request, res: Response) {
    try {
      const comentarios = await service.listarComentarios();
      return res.json(comentarios);
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
      const comentario = await service.obtenerComentarioPorId(id);
      return res.json(comentario);
    } catch (error: any) {
      if (error.message === 'Comentario no encontrado') {
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
      const comentarios = await service.obtenerComentariosPorTopicoId(topicoId);
      return res.json(comentarios);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorEditor(req: Request, res: Response) {
    try {
      const editorId = parseInt(req.params.editorId);
      if (isNaN(editorId)) {
        return res.status(400).json({ error: 'ID de editor invalido' });
      }
      const comentarios = await service.obtenerComentariosPorEditorId(editorId);
      return res.json(comentarios);
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
      const nuevo = await service.crearComentario(payload);
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
      const actualizado = await service.editarComentario(id, cambios);
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
      await service.borrarComentario(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}

