import { nota } from '../models/nota';
import { notaRepository } from '../repositories/notaRepository';

export class notaService {
  private repo: notaRepository;

  constructor() {
    this.repo = new notaRepository();
  }

  async listarNotas(): Promise<nota[]> {
    return await this.repo.findAll();
  }

  async obtenerNotaPorId(id: number): Promise<nota> {
    const nota = await this.repo.findById(id);
    if (!nota) {
      throw new Error('Nota no encontrada');
    }
    return nota;
  }

  async obtenerNotasPorInscritoId(inscritoId: number): Promise<nota[]> {
    return await this.repo.findByInscritoId(inscritoId);
  }

  async obtenerNotasPorTareaId(tareaId: number): Promise<nota[]> {
    return await this.repo.findByTareaId(tareaId);
  }

  async obtenerNotasPorEvaluacionId(evaluacionId: number): Promise<nota[]> {
    return await this.repo.findByEvaluacionId(evaluacionId);
  }

  async obtenerNotasPorTopicoId(topicoId: number): Promise<nota[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async crearNota(payload: {
    nota: number;
    tarea_id?: number | null;
    evaluacion_id?: number | null;
    inscrito_id?: number | null;
    topico_id?: number | null;
    comentario?: string | null;
  }): Promise<nota> {
    if (payload.nota === undefined || payload.nota === null) {
      throw new Error('La nota es obligatoria');
    }
    
    const finalPayload = {
      nota: payload.nota,
      tarea_id: payload.tarea_id || null,
      evaluacion_id: payload.evaluacion_id || null,
      inscrito_id: payload.inscrito_id || null,
      topico_id: payload.topico_id || null,
      comentario: payload.comentario || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarNota(id: number, cambios: Partial<{
    nota: number;
    tarea_id: number | null;
    evaluacion_id: number | null;
    inscrito_id: number | null;
    topico_id: number | null;
    comentario: string | null;
  }>): Promise<nota> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Nota no encontrada para actualizar');
    }
    return actualizado;
  }

  async borrarNota(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Nota no encontrada para eliminar');
    }
  }
}
