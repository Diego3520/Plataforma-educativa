export interface evaluacion {
  id_evaluacion: number;
  id_topico: number | null;
  fecha_publicacion: string;
  fecha_limite: string | null;
  material_id: number | null;
  nota_max: number | null;
  respuesta_id: number | null;
  creado_at: string;
}
