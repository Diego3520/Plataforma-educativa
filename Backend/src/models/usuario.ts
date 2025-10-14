export interface usuario {
  id_usuario: number;
  // cod_sis: string | null; // Eliminado según lo solicitado
  descripcion: string | null;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo: string | null;
  password: string; // Nuevo campo para contraseña
  avatar_url: string | null; // Nuevo campo para avatar URL
  creado_at: string;
  activo: boolean;
}
