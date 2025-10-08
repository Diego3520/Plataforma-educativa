export interface curso {
  id_curso: number;
  codigo: string;
  editor_id: number | null;
  docente_id: number | null;
  evaluador_id: number | null;
  fecha_creacion: string;
  titulo: string | null;
  descripcion: string | null;
}
