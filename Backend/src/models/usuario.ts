export interface usuario {
    id_usuario: number;
    descripcion: string | null;
    nombre: string;
    apellido: string;
    tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
    correo: string | null;
    activo: boolean;
    password_hash: string | null;
    google_id: string | null;
    microsoft_id: string | null;
    creado_at: Date;
    avatar_url: string | null;
}
