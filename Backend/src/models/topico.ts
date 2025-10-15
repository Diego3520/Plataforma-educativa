export interface topico {
  id_topico: number;
  id_curso: number;
  orden: number;
  titulo: string | null;
  descripcion: string | null;
  material_id: number | null;
  activo: boolean;
  creado_at: string;
}
