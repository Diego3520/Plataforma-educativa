import { respuesta } from '../models/respuesta';
import { respuestaRepository } from '../repositories/respuestaRepository';

export class respuestaService {
  private repo: respuestaRepository;

  constructor() {
    this.repo = new respuestaRepository();
  }

  async listarRespuestas(): Promise<respuesta[]> {
    return await this.repo.findAll();
  }

  async obtenerRespuestaPorId(id: number): Promise<respuesta> {
    const respuesta = await this.repo.findById(id);
    if (!respuesta) {
      throw new Error('Respuesta no encontrada');
    }
    return respuesta;
  }

  async obtenerRespuestasPorNumPregunta(numPregunta: number): Promise<respuesta[]> {
    return await this.repo.findByNumPregunta(numPregunta);
  }

  async crearRespuesta(payload: {
    num_pregunta: number;
    pregunta_descripcion?: string | null;
    respuesta_dada?: string | null;
  }): Promise<respuesta> {
    if (payload.num_pregunta === undefined || payload.num_pregunta === null) {
      throw new Error('El num_pregunta es obligatorio');
    }
    
    const finalPayload = {
      num_pregunta: payload.num_pregunta,
      pregunta_descripcion: payload.pregunta_descripcion || null,
      respuesta_dada: payload.respuesta_dada || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarRespuesta(id: number, cambios: Partial<{
    num_pregunta: number;
    pregunta_descripcion: string | null;
    respuesta_dada: string | null;
  }>): Promise<respuesta> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Respuesta no encontrada para actualizar');
    }
    return actualizado;
  }

  async borrarRespuesta(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Respuesta no encontrada para eliminar');
    }
  }
}
