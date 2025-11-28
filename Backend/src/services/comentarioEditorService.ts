import { comentarioEditor } from '../models/comentarioEditor';
import { comentarioEditorRepository } from '../repositories/comentarioEditorRepository';

export class comentarioEditorService {
  private repo: comentarioEditorRepository;

  constructor() {
    this.repo = new comentarioEditorRepository();
  }

  async listarComentarios(): Promise<comentarioEditor[]> {
    return await this.repo.findAll();
  }

  async obtenerComentarioPorId(id: number): Promise<comentarioEditor> {
    const comentario = await this.repo.findById(id);
    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }
    return comentario;
  }

  async obtenerComentariosPorTopicoId(topicoId: number): Promise<comentarioEditor[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async obtenerComentariosPorEditorId(editorId: number): Promise<comentarioEditor[]> {
    return await this.repo.findByEditorId(editorId);
  }

  async crearComentario(payload: {
    id_topico: number;
    id_editor: number;
    contenido: string;
    tipo: 'comentario' | 'contenido' | 'material';
    material_id?: number | null;
    activo?: boolean;
  }): Promise<comentarioEditor> {
    if (!payload.id_topico) {
      throw new Error('El id_topico es obligatorio');
    }
    if (!payload.id_editor) {
      throw new Error('El id_editor es obligatorio');
    }
    if (!payload.contenido || !payload.contenido.trim()) {
      throw new Error('El contenido es obligatorio');
    }
    
    const finalPayload = {
      id_topico: payload.id_topico,
      id_editor: payload.id_editor,
      contenido: payload.contenido.trim(),
      tipo: payload.tipo,
      material_id: payload.material_id || null,
      activo: payload.activo === undefined ? true : payload.activo
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarComentario(id: number, cambios: Partial<{
    contenido: string;
    tipo: 'comentario' | 'contenido' | 'material';
    material_id: number | null;
    activo: boolean;
  }>): Promise<comentarioEditor> {
    if (cambios.contenido !== undefined && !cambios.contenido.trim()) {
      throw new Error('El contenido no puede estar vacío');
    }
    
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Comentario no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarComentario(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Comentario no encontrado para eliminar');
    }
  }
}

