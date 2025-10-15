import { tarea } from '../models/tarea';
import { tareaRepository } from '../repositories/tareaRepository';

export class tareaService {
  private repo: tareaRepository;

  constructor() {
    this.repo = new tareaRepository();
  }

  async listarTareas(): Promise<tarea[]> {
    return await this.repo.findAll();
  }

  async obtenerTareaPorId(id: number): Promise<tarea> {
    const tarea = await this.repo.findById(id);
    if (!tarea) {
      throw new Error('Tarea no encontrada');
    }
    return tarea;
  }

  async obtenerTareasPorTopicoId(topicoId: number): Promise<tarea[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async crearTarea(payload: {
    id_topico?: number | null;
    fecha_publicacion: string;
    fecha_limite?: string | null;
    material_id?: number | null;
    nota_max?: number | null;
    solucion_aportada?: string | null;
  }): Promise<tarea> {
    if (!payload.fecha_publicacion) {
      throw new Error('La fecha_publicacion es obligatoria');
    }
    
    const finalPayload = {
      id_topico: payload.id_topico || null,
      fecha_publicacion: payload.fecha_publicacion,
      fecha_limite: payload.fecha_limite || null,
      material_id: payload.material_id || null,
      nota_max: payload.nota_max || null,
      solucion_aportada: payload.solucion_aportada || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarTarea(id: number, cambios: Partial<{
    id_topico: number | null;
    fecha_publicacion: string;
    fecha_limite: string | null;
    material_id: number | null;
    nota_max: number | null;
    solucion_aportada: string | null;
  }>): Promise<tarea> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Tarea no encontrada para actualizar');
    }
    return actualizado;
  }

  async borrarTarea(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Tarea no encontrada para eliminar');
    }
  }
}
