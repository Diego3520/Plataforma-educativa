import { inscrito } from '../models/inscrito';
import { inscritoRepository } from '../repositories/inscritoRepository';

export class inscritoService {
  private repo: inscritoRepository;

  constructor() {
    this.repo = new inscritoRepository();
  }

  async listarInscritos(): Promise<inscrito[]> {
    return await this.repo.findAll();
  }

  async obtenerInscritoPorId(id: number): Promise<inscrito> {
    const inscrito = await this.repo.findById(id);
    if (!inscrito) {
      throw new Error('Inscrito no encontrado');
    }
    return inscrito;
  }

  async obtenerInscritosPorUsuarioId(usuarioId: number): Promise<inscrito[]> {
    return await this.repo.findByUsuarioId(usuarioId);
  }

  async obtenerCursosPorUsuarioId(usuarioId: number): Promise<any[]> {
    return await this.repo.findCursosByUsuarioId(usuarioId);
  }

  async inscribirsePorCodigo(codigoCurso: string, usuarioId: number): Promise<inscrito> {
    // Verificar si el usuario ya está inscrito en algún tópico de este curso
    const cursosUsuario = await this.repo.findCursosByUsuarioId(usuarioId);
    const yaInscrito = cursosUsuario.some((c: any) => c.codigo === codigoCurso);
    
    if (yaInscrito) {
      throw new Error('Ya estás inscrito en este curso');
    }

    // Obtener el tópico por código de curso
    const { topicoService } = await import('./topicoService');
    const topicoServiceInstance = new topicoService();
    const topico = await topicoServiceInstance.obtenerTopicoPorCodigoCurso(codigoCurso);
    
    // Crear la inscripción
    return await this.crearInscrito({
      id_topico: topico.id_topico,
      id_usuario: usuarioId
    });
  }

  async obtenerInscritosPorTopicoId(topicoId: number): Promise<inscrito[]> {
    return await this.repo.findByTopicoId(topicoId);
  }

  async crearInscrito(payload: {
    id_topico: number;
    id_usuario: number;
  }): Promise<inscrito> {
    if (!payload.id_topico) {
      throw new Error('El id_topico es obligatorio');
    }
    if (!payload.id_usuario) {
      throw new Error('El id_usuario es obligatorio');
    }
    
    const finalPayload = {
      id_topico: payload.id_topico,
      id_usuario: payload.id_usuario
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarInscrito(id: number, cambios: Partial<{
    id_topico: number;
    id_usuario: number;
  }>): Promise<inscrito> {
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Inscrito no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarInscrito(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Inscrito no encontrado para eliminar');
    }
  }
}
