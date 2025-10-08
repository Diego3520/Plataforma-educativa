import { evaluacion } from '../models/evaluacion';
import { evaluacionRepository } from '../repositories/evaluacionRepository';

export class evaluacionService {
  private repo: evaluacionRepository;

  constructor() {
    this.repo = new evaluacionRepository();
  }

  async listarEvaluaciones(): Promise<evaluacion[]> {
    return await this.repo.findAll();
  }

  async obtenerEvaluacionPorId(id: number): Promise<evaluacion> {
    const evaluacion = await this.repo.findById(id);
    if (!evaluacion) {
      throw new Error('Evaluacion no encontrada');
    }
    return evaluacion;
  }

  async obtenerEvaluacionesPorTopicoId(topicoId: number): Promise<evaluacion[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async crearEvaluacion(payload: {
    id_topico?: number | null;
    fecha_publicacion: string;
    fecha_limite?: string | null;
    material_id?: number | null;
    nota_max?: number | null;
    respuesta_id?: number | null;
  }): Promise<evaluacion> {
    if (!payload.fecha_publicacion) {
      throw new Error('La fecha_publicacion es obligatoria');
    }
    
    const finalPayload = {
      id_topico: payload.id_topico || null,
      fecha_publicacion: payload.fecha_publicacion,
      fecha_limite: payload.fecha_limite || null,
      material_id: payload.material_id || null,
      nota_max: payload.nota_max || null,
      respuesta_id: payload.respuesta_id || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarEvaluacion(id: number, cambios: Partial<{
    id_topico: number | null;
    fecha_publicacion: string;
    fecha_limite: string | null;
    material_id: number | null;
    nota_max: number | null;
    respuesta_id: number | null;
  }>): Promise<evaluacion> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Evaluacion no encontrada para actualizar');
    }
    return actualizado;
  }

  async borrarEvaluacion(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Evaluacion no encontrada para eliminar');
    }
  }
}
