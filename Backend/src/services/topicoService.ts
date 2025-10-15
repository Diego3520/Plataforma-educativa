import { topico } from '../models/topico';
import { topicoRepository } from '../repositories/topicoRepository';

export class topicoService {
  private repo: topicoRepository;

  constructor() {
    this.repo = new topicoRepository();
  }

  async listarTopicos(): Promise<topico[]> {
    return await this.repo.findAll();
  }

  async obtenerTopicoPorId(id: number): Promise<topico> {
    const topico = await this.repo.findById(id);
    if (!topico) {
      throw new Error('Topico no encontrado');
    }
    return topico;
  }

  async obtenerTopicosPorCursoId(cursoId: number): Promise<topico[]> {
    return await this.repo.findByCursoId(cursoId);
  }

  async crearTopico(payload: {
    id_curso: number;
    orden: number;
    titulo?: string | null;
    descripcion?: string | null;
    material_id?: number | null;
    activo?: boolean;
  }): Promise<topico> {
    if (!payload.id_curso) {
      throw new Error('El id_curso es obligatorio');
    }
    if (payload.orden === undefined || payload.orden === null) {
      throw new Error('El orden es obligatorio');
    }
    
    const finalPayload = {
      id_curso: payload.id_curso,
      orden: payload.orden,
      titulo: payload.titulo || null,
      descripcion: payload.descripcion || null,
      material_id: payload.material_id || null,
      activo: payload.activo === undefined ? true : payload.activo
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarTopico(id: number, cambios: Partial<{
    id_curso: number;
    orden: number;
    titulo: string | null;
    descripcion: string | null;
    material_id: number | null;
    activo: boolean;
  }>): Promise<topico> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Topico no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarTopico(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Topico no encontrado para eliminar');
    }
  }
}
