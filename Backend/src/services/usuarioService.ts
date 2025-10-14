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
        cod_sis?: string | null;
        descripcion?: string | null;
        nombre: string;
        apellido: string;
        tipo: string;
        correo?: string | null;
        activo?: boolean;
        password?: string;
        google_id?: string | null;
        microsoft_id?: string | null;
    }): Promise<usuario> {
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

        let password_hash = null;
        if (payload.password) {
            const saltRounds = 10;
            password_hash = await bcrypt.hash(payload.password, saltRounds);
            console.log('hash generado:', password_hash); // <-- LOG IMPORTANTE
        } else {
            console.log('No se recibió password en el payload!');
        }

        const finalPayload = {
            cod_sis: payload.cod_sis ? payload.cod_sis : null,
            descripcion: payload.descripcion ? payload.descripcion : null,
            nombre: payload.nombre,
            apellido: payload.apellido,
            tipo: payload.tipo as any,
            correo: payload.correo ? payload.correo : null,
            activo: payload.activo === undefined ? true : payload.activo,
            password_hash,
            google_id: payload.google_id ?? null,
            microsoft_id: payload.microsoft_id ?? null,
        };
        console.log('Payload final que se manda al repo:', finalPayload); // <-- LOG IMPORTANTE
        return await this.repo.create(finalPayload as any);
    }

    async editarUsuario(id: number, cambios: Partial<{
        cod_sis: string | null;
        descripcion: string | null;
        nombre: string;
        apellido: string;
        tipo: string;
        correo: string | null;
        activo: boolean;
        password?: string;
        password_hash?: string | null;
        google_id?: string | null;
        microsoft_id?: string | null;
    }>): Promise<usuario> {
        if (cambios.tipo !== undefined) {
            const tiposPermitidos = ['docente', 'alumno', 'evaluador', 'editor', 'admin'];
            if (tiposPermitidos.indexOf(cambios.tipo) === -1) {
                throw new Error('Tipo de usuario inválido');
            }
        }

        if (cambios.password) {
            const saltRounds = 10;
            cambios.password_hash = await bcrypt.hash(cambios.password, saltRounds);
            console.log('hash generado en edición:', cambios.password_hash); // <-- LOG IMPORTANTE
            delete cambios.password;
        }

        console.log('Payload de edición que se manda al repo:', cambios); // <-- LOG IMPORTANTE
        const actualizado = await this.repo.update(id, cambios as any);
        if (!actualizado) {
            throw new Error('Usuario no encontrado para actualizar');
        }
        return actualizado;
    }

    async borrarUsuario(id: number): Promise<void> {
        const eliminado = await this.repo.delete(id);
        if (!eliminado) {
            throw new Error('Usuario no encontrado para eliminar');
        }
    }
}