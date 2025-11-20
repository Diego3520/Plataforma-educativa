import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { materialService } from '../services/materialService';

const service = new materialService();

export class materialController {
  static async listar(req: Request, res: Response) {
    try {
      const materiales = await service.listarMateriales();
      return res.json(materiales);
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
      const material = await service.obtenerMaterialPorId(id);
      return res.json(material);
    } catch (error: any) {
      if (error.message === 'Material no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorTipo(req: Request, res: Response) {
    try {
      const contentType = req.params.contentType;
      const materiales = await service.obtenerMaterialesPorTipo(contentType);
      return res.json(materiales);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorCurso(req: Request, res: Response) {
    try {
      const cursoId = parseInt(req.params.id_curso);
      if (isNaN(cursoId)) {
        return res.status(400).json({ error: 'ID de curso invalido' });
      }
      const materiales = await service.obtenerMaterialesPorCurso(cursoId);
      return res.json(materiales);
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
      if (!payload.id_curso) {
        return res.status(400).json({ error: 'id_curso es requerido' });
      }
      const nuevo = await service.crearMaterial(payload);
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
      const actualizado = await service.editarMaterial(id, cambios);
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
      await service.borrarMaterial(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
