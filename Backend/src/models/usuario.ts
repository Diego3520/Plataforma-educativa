export interface usuario {
    id_usuario: number;
    cod_sis?: string | null;
    descripcion?: string | null;
    nombre: string;
    apellido: string;
    tipo: string;
    correo?: string | null;
    activo?: boolean;
    password_hash?: string | null;
    google_id?: string | null;
    microsoft_id?: string | null;
    creado_at?: Date;
}