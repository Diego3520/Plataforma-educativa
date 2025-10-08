import { editor } from '../models/editor';
import { editorRepository } from '../repositories/editorRepository';

export class editorService {
  private repo: editorRepository;

  constructor() {
    this.repo = new editorRepository();
  }

  async listarEditores(): Promise<editor[]> {
    return await this.repo.findAll();
  }

  async obtenerEditorPorId(id: number): Promise<editor> {
    const editor = await this.repo.findById(id);
    if (!editor) {
      throw new Error('Editor no encontrado');
    }
    return editor;
  }

  async obtenerEditorPorDocenteId(docenteId: number): Promise<editor | null> {
    return await this.repo.findByDocenteId(docenteId);
  }

  async crearEditor(payload: {
    id_docente: number;
    activo?: boolean;
  }): Promise<editor> {
    if (!payload.id_docente) {
      throw new Error('El id_docente es obligatorio');
    }
    
    const finalPayload = {
      id_docente: payload.id_docente,
      activo: payload.activo === undefined ? true : payload.activo
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarEditor(id: number, cambios: Partial<{
    id_docente: number;
    activo: boolean;
  }>): Promise<editor> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Editor no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarEditor(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Editor no encontrado para eliminar');
    }
  }
}
