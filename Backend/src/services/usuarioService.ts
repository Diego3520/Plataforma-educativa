import { usuario } from '../models/usuario';
import { usuarioRepository } from '../repositories/usuarioRepository';
import bcrypt from 'bcrypt';

export class usuarioService {
    private repo: usuarioRepository;

    constructor() {
        this.repo = new usuarioRepository();
    }

    async listarUsuarios(): Promise<usuario[]> {
        return await this.repo.findAll();
    }

    async obtenerUsuarioPorId(id: number): Promise<usuario> {
        const usuario = await this.repo.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    }

    

  async crearUsuario(payload: {
    descripcion?: string | null;
    nombre: string;
    apellido: string;
    tipo: string;
    correo?: string | null;
    password?: string;
    avatar_url?: string | null;
    activo?: boolean;
    google_id?: string | null;
    microsoft_id?: string | null;
  }): Promise<usuario> {
    // validaciones basicas
    if (!payload.nombre) {
      throw new Error('El nombre es obligatorio');
    }
    if (!payload.apellido) {
      throw new Error('El apellido es obligatorio');
    }
    const tiposPermitidos = ['docente', 'alumno', 'evaluador', 'editor', 'admin'];
    if (tiposPermitidos.indexOf(payload.tipo) === -1) {
      throw new Error('Tipo de usuario inválido');
    }

    // Hash password if provided
    let passwordHash = null;
    if (payload.password) {
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(payload.password, saltRounds);
    }

    const finalPayload = {
      descripcion: payload.descripcion ? payload.descripcion : null,
      nombre: payload.nombre,
      apellido: payload.apellido,
      tipo: payload.tipo as any,
      correo: payload.correo ? payload.correo : null,
      password_hash: passwordHash,
      google_id: payload.google_id ? payload.google_id : null,
      microsoft_id: payload.microsoft_id ? payload.microsoft_id : null,
      avatar_url: payload.avatar_url ? payload.avatar_url : null,
      activo: payload.activo === undefined ? true : payload.activo
    };
    return await this.repo.create(finalPayload as any);
  }

  async editarUsuario(id: number, cambios: Partial<{
    descripcion: string | null;
    nombre: string;
    apellido: string;
    tipo: string;
    correo: string | null;
    password: string;
    avatar_url: string | null;
    activo: boolean;
  }>): Promise<usuario> {
    // Si hay tipo validar
    if (cambios.tipo !== undefined) {
      const tiposPermitidos = ['docente', 'alumno', 'evaluador', 'editor', 'admin'];
      if (tiposPermitidos.indexOf(cambios.tipo) === -1) {
        throw new Error('Tipo de usuario inválido');
      }
    }
    // Realizar la actualización usando el repositorio
    const actualizado = await this.repo.update(id, cambios as any);
    if (!actualizado) {
      throw new Error('Usuario no encontrado para editar');
    }
    return actualizado;
  }

  async borrarUsuario(id: number): Promise<void> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) {
      throw new Error('Usuario no encontrado para eliminar');
    }
  }

  async buscarUsuarioPorCorreo(correo: string): Promise<usuario[]> {
    return await this.repo.findByEmail(correo);
  }
}