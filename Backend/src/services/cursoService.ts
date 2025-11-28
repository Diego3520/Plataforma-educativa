import { curso } from '../models/curso';
import { cursoRepository } from '../repositories/cursoRepository';
import { topicoService } from './topicoService';

export class cursoService {
  private repo: cursoRepository;
  private topicoService: topicoService;

  constructor() {
    this.repo = new cursoRepository();
    this.topicoService = new topicoService();
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
    activo?: boolean;
  }): Promise<curso> {
    if (!payload.codigo) {
      throw new Error('El codigo es obligatorio');
    }

    // Si el nuevo curso será activo, desactivar todos los demás automáticamente
    const seraActivo = payload.activo !== undefined ? payload.activo : true;
    
    const finalPayload = {
      codigo: payload.codigo,
      editor_id: payload.editor_id || null,
      docente_id: payload.docente_id || null,
      evaluador_id: payload.evaluador_id || null,
      titulo: payload.titulo || null,
      descripcion: payload.descripcion || null,
      activo: seraActivo
    };
    
    // Si será activo, desactivar todos los demás antes de crear
    if (seraActivo) {
      await this.repo.setAllInactive();
    }
    
    const nuevoCurso = await this.repo.create(finalPayload as any);
    
    // Crear un tópico automáticamente para el nuevo curso
    await this.topicoService.crearTopico({
      id_curso: nuevoCurso.id_curso,
      orden: 1,
      titulo: nuevoCurso.titulo,
      descripcion: nuevoCurso.descripcion,
      activo: nuevoCurso.activo
    });
    
    return nuevoCurso;
  }

  async editarCurso(id: number, cambios: Partial<{
    codigo: string;
    editor_id: number | null;
    docente_id: number | null;
    evaluador_id: number | null;
    titulo: string | null;
    descripcion: string | null;
    activo: boolean;
  }>): Promise<curso> {
    // Si se está activando este curso, desactivar todos los demás automáticamente (excepto este)
    if (cambios.activo === true) {
      await this.repo.setAllInactive(id);
    }

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
