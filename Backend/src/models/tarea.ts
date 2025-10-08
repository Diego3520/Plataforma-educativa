export interface tarea {
  id_tarea: number;
  id_topico: number | null;
  fecha_publicacion: string;
  fecha_limite: string | null;
  material_id: number | null;
  nota_max: number | null;
  solucion_aportada: string | null;
  creado_at: string;
}
