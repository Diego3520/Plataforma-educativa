import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { cursoService } from '../services/cursoService';

const service = new cursoService();

export class cursoController {
  static async listar(req: Request, res: Response) {
    try {
      const cursos = await service.listarCursos();
      return res.json(cursos);
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
      const curso = await service.obtenerCursoPorId(id);
      return res.json(curso);
    } catch (error: any) {
      if (error.message === 'Curso no encontrado') {
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
      const cursos = await service.obtenerCursosPorDocenteId(docenteId);
      return res.json(cursos);
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
      const cursos = await service.obtenerCursosPorEditorId(editorId);
      return res.json(cursos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async verPorEvaluador(req: Request, res: Response) {
    try {
      const evaluadorId = parseInt(req.params.evaluadorId);
      if (isNaN(evaluadorId)) {
        return res.status(400).json({ error: 'ID de evaluador invalido' });
      }
      const cursos = await service.obtenerCursosPorEvaluadorId(evaluadorId);
      return res.json(cursos);
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
      const nuevo = await service.crearCurso(payload);
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
      const actualizado = await service.editarCurso(id, cambios);
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
      await service.borrarCurso(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
