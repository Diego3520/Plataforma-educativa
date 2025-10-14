export interface usuario {
  id_usuario: number;
  cod_sis: string | null;
  descripcion: string | null;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo: string | null;
  creado_at: string;
  activo: boolean;
  password_hash: string | null;
}
