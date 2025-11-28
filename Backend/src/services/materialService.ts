import { material } from '../models/material';
import { materialRepository } from '../repositories/materialRepository';

export class materialService {
  private repo: materialRepository;

  constructor() {
    this.repo = new materialRepository();
  }

  async listarMateriales(): Promise<material[]> {
    return await this.repo.findAll();
  }

  async obtenerMaterialPorId(id: number): Promise<material> {
    const material = await this.repo.findById(id);
    if (!material) {
      throw new Error('Material no encontrado');
    }
    return material;
  }

  async obtenerMaterialesPorTipo(contentType: string): Promise<material[]> {
    return await this.repo.findByContentType(contentType);
  }

  async crearMaterial(payload: {
    solucion_modelo?: string | null;
    ruta_archivo?: string | null;
    tamano_bytes?: number | null;
    mime_type?: string | null;
    content_type: 'pdf' | 'video' | 'imagen' | 'otro';
    activo?: boolean;
    id_curso: number;
  }): Promise<material> {
    if (!payload.content_type) {
      throw new Error('El content_type es obligatorio');
    }
    if (!payload.id_curso) {
      throw new Error('El id_curso es obligatorio');
    }
    const tiposPermitidos = ['pdf', 'video', 'imagen', 'otro'];
    if (tiposPermitidos.indexOf(payload.content_type) === -1) {
      throw new Error('Tipo de contenido invalido');
    }

    const finalPayload = {
      solucion_modelo: payload.solucion_modelo || null,
      ruta_archivo: payload.ruta_archivo || null,
      tamano_bytes: payload.tamano_bytes || null,
      mime_type: payload.mime_type || null,
      content_type: payload.content_type,
      activo: payload.activo === undefined ? true : payload.activo,
      id_curso: payload.id_curso
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarMaterial(id: number, cambios: Partial<{
    solucion_modelo: string | null;
    ruta_archivo: string | null;
    tamano_bytes: number | null;
    mime_type: string | null;
    content_type: 'pdf' | 'video' | 'imagen' | 'otro';
    activo: boolean;
  }>): Promise<material> {
    if (cambios.content_type !== undefined) {
      const tiposPermitidos = ['pdf', 'video', 'imagen', 'otro'];
      if (tiposPermitidos.indexOf(cambios.content_type) === -1) {
        throw new Error('Tipo de contenido invalido');
      }
    }
    
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Material no encontrado para actualizar');
    }
    return actualizado;
  }

  async borrarMaterial(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Material no encontrado para eliminar');
    }
  }

  async obtenerMaterialesPorCurso(cursoId: number): Promise<material[]> {
    return await this.repo.findByCurso(cursoId);
  }
}
