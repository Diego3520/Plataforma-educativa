import { curso } from '../models/curso';
import { cursoRepository } from '../repositories/cursoRepository';

export class cursoService {
  private repo: cursoRepository;

  constructor() {
    this.repo = new cursoRepository();
  }

  async listarCursos(): Promise<curso[]> {
    return await this.repo.findAll();
  }

  async obtenerCursoPorId(id: number): Promise<curso> {
    const curso = await this.repo.findById(id);
    if (!curso) {
      throw new Error('Curso no encontrado');
    }
    return curso;
  }

  async obtenerCursosPorDocenteId(docenteId: number): Promise<curso[]> {
    return await this.repo.findByDocenteId(docenteId);
  }

  async obtenerCursosPorEditorId(editorId: number): Promise<curso[]> {
    return await this.repo.findByEditorId(editorId);
  }

  async obtenerCursosPorEvaluadorId(evaluadorId: number): Promise<curso[]> {
    return await this.repo.findByEvaluadorId(evaluadorId);
  }

  async crearCurso(payload: {
    codigo: string;
    editor_id?: number | null;
    docente_id?: number | null;
    evaluador_id?: number | null;
    titulo?: string | null;
    descripcion?: string | null;
  }): Promise<curso> {
    if (!payload.codigo) {
      throw new Error('El codigo es obligatorio');
    }
    
    const finalPayload = {
      codigo: payload.codigo,
      editor_id: payload.editor_id || null,
      docente_id: payload.docente_id || null,
      evaluador_id: payload.evaluador_id || null,
      titulo: payload.titulo || null,
      descripcion: payload.descripcion || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarCurso(id: number, cambios: Partial<{
    codigo: string;
    editor_id: number | null;
    docente_id: number | null;
    evaluador_id: number | null;
    titulo: string | null;
    descripcion: string | null;
  }>): Promise<curso> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Curso no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarCurso(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Curso no encontrado para eliminar');
    }
  }
}
