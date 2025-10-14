export interface usuario {
    id_usuario: number;
    // cod_sis: string | null; // Eliminado según lo solicitado
    descripcion: string | null;
    nombre: string;
    apellido: string;
    tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
    correo: string | null;
    activo: boolean;
    password: string; // Nuevo campo para contraseña de registro pero funciona igual que el _hash elegir uno
    password_hash?: string | null;
    google_id?: string | null;
    microsoft_id?: string | null;
    creado_at: Date;
    avatar_url: string | null; // Nuevo campo para avatar URL

}
