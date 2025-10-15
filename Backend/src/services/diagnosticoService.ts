import { diagnostico } from '../models/diagnostico';
import { diagnosticoRepository } from '../repositories/diagnosticoRepository';

export class diagnosticoService {
  private repo: diagnosticoRepository;

  constructor() {
    this.repo = new diagnosticoRepository();
  }

  async listarDiagnosticos(): Promise<diagnostico[]> {
    return await this.repo.findAll();
  }

  async obtenerDiagnosticoPorId(id: number): Promise<diagnostico> {
    const diagnostico = await this.repo.findById(id);
    if (!diagnostico) {
      throw new Error('Diagnostico no encontrado');
    }
    return diagnostico;
  }

  async obtenerDiagnosticosPorTopicoId(topicoId: number): Promise<diagnostico[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async obtenerDiagnosticosPorDiagnosticadorId(diagnosticadorId: number): Promise<diagnostico[]> {
    return await this.repo.findByDiagnosticadorId(diagnosticadorId);
  }

  async crearDiagnostico(payload: {
    id_topico: number;
    id_diagnosticador: number;
    nota_diagn?: number | null;
    descripcion?: string | null;
  }): Promise<diagnostico> {
    if (!payload.id_topico) {
      throw new Error('El id_topico es obligatorio');
    }
    if (!payload.id_diagnosticador) {
      throw new Error('El id_diagnosticador es obligatorio');
    }
    
    const finalPayload = {
      id_topico: payload.id_topico,
      id_diagnosticador: payload.id_diagnosticador,
      nota_diagn: payload.nota_diagn || null,
      descripcion: payload.descripcion || null
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarDiagnostico(id: number, cambios: Partial<{
    id_topico: number;
    id_diagnosticador: number;
    nota_diagn: number | null;
    descripcion: string | null;
  }>): Promise<diagnostico> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Diagnostico no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarDiagnostico(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Diagnostico no encontrado para eliminar');
    }
  }
}
