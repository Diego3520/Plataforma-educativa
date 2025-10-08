import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { editorService } from '../services/editorService';

const service = new editorService();

export class editorController {
  static async listar(req: Request, res: Response) {
    try {
      const editores = await service.listarEditores();
      return res.json(editores);
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
      const editor = await service.obtenerEditorPorId(id);
      return res.json(editor);
    } catch (error: any) {
      if (error.message === 'Editor no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorDocente(req: Request, res: Response) {
    try {
      const docenteId = parseInt(req.params.docenteId);
      if (isNaN(docenteId)) {
        return res.status(400).json({ error: 'ID de docente invalido' });
      }
      const editor = await service.obtenerEditorPorDocenteId(docenteId);
      return res.json(editor);
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
      const nuevo = await service.crearEditor(payload);
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
      const actualizado = await service.editarEditor(id, cambios);
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
      await service.borrarEditor(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
