export interface material {
  material_id: number;
  solucion_modelo: string | null;
  ruta_archivo: string | null;
  tamano_bytes: number | null;
  mime_type: string | null;
  content_type: 'pdf' | 'video' | 'imagen' | 'otro';
  creado_at: string;
  activo: boolean;
  id_curso: number;
}
