export interface nota {
  id_nota: number;
  nota: number;
  tarea_id: number | null;
  evaluacion_id: number | null;
  inscrito_id: number | null;
  topico_id: number | null;
  fecha_registro: string;
  comentario: string | null;
}
